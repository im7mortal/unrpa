class Extractor {
    constructor() {
    }

    isV1(fileName) {
        return fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase() === 'rpi'
    }

    isV2(length) {
        return length === 2
    }

    v3String = "RPA-3.0"

    isV3(v) {
        return v === this.v3String
    }

    async parseHeader(filename, headerString) {
        try {
            logMessage("Analyze \"" + filename + "\"")
            if (this.isV1(filename)) {
                logError("The RPA-1.0 which has extension '.rpi' is not supported");
                return
            }

            // Extract the first line from the chunk
            const firstLineEndIndex = headerString.indexOf('\n');

            // Check if the chunk does not contain '\n'
            if (firstLineEndIndex === -1) {
                console.log("Is it RPA format? The first 100 bytes do not contain a newline character.");
                logError("Is it RPA file? The archive has errors");
                return;
            }
            const firstLine = headerString.substring(0, firstLineEndIndex >= 0 ? firstLineEndIndex : textChunk.length);

            // Process the first line here...
            console.log(firstLine);

            // Process the file content to detect version
            const lines = firstLine.split('\n');
            const header = lines[0];
            const parts = header.split(' ');

            if (parts.length < 2 || parts.length > 4) {
                console.log("Is it RPA file? Number of header components doesn't match to any format")
                logError("Is it RPA file? The archive has errors");
                return;
            }

            if (this.isV2(parts.length)) {
                logError("Looks like it's RPA-2.0 format which is not supported");
                return;
            }

            let offsetParse = this.stringToBigInt(parts[1]);
            let keyParse = this.stringToBigInt(parts[2]);
            if (!offsetParse[1] || !keyParse[1]) {
                console.log("Is it RPA file? The archive header has errors");
                logError("Is it RPA file? The archive has errors");
                return
            }

            const offsetNumber = offsetParse[0];
            const keyNumber = keyParse[0];

            if (!this.isV3(parts[0])) {
                logError("Is it RPA file? It doesn't match to any RPA version");
                return
            } else {
                logMessage("Detected version " + this.v3String)
            }
            return [offsetNumber, keyNumber]

        } catch (error) {
            console.log("Error processing file " + error);
            logError("Is it RPA file? The archive has errors");
        }
    }

    async parseMetadata(metadataSrc, keyNumber) {
        try {
            const reader = new FileReader();
            reader.onload = async function (e) {
                const arrayBuffer = e.target.result;
                const bytes = new Uint8Array(arrayBuffer);

                // Now, bytes can be sent to the WASM module
                await sendBytesToWasm(bytes, keyNumber);
            };
            reader.readAsArrayBuffer(metadataSrc);

        } catch (error) {
            console.log("Error processing file " + error);
            logError("Is it RPA file? The archive has errors");
        }
    }

    async extractMetadata(file) {

        // The header size is around 33 bytes. We will check 100
        const chunkSize = 100;
        const blob = file.slice(0, chunkSize);
        const textChunk = await blob.text();

        let res = await this.parseHeader(file.name, textChunk)
        if (res === undefined) {
            return
        }
        let offsetNumber = res[0];
        let keyNumber = res[1];

        const blobSlice = file.slice(offsetNumber);

        await this.parseMetadata(blobSlice, keyNumber)

    }


    Metadata = null;

    async notifyCompletion(result) {

        this.Metadata = JSON.parse(result);

        logMessage("Successfully parsed metadata. " + this.Metadata.length + " files are ready to extraction")

    }

    isHexString(str) {
        // This regex matches a string that starts with "0x" or "0X" (optional)
        // followed by one or more hexadecimal characters (0-9, a-f, A-F).
        // The ^ and $ ensure the entire string matches this pattern.
        const regex1 = /^0x[0-9a-fA-F]+$/i;
        const regex2 = /^[0-9a-fA-F]+$/i;
        return regex1.test(str) || regex2.test(str);
    }

    stringToBigInt(hexString) {

        if (!this.isHexString(hexString)) {
            console.log("\"" + hexString + "\" is not hex string")
            return [0, false]
        }

        // Ensure the hex string length is even for proper conversion
        if (hexString.length % 2 !== 0) {
            console.error("Hex string must have an even length");
            return [0, false]
        }

        // Convert the hex string to a BigInt
        const number = Number(BigInt("0x" + hexString));

        return [number, true];
    }

}

class FileSystemAccessApi extends Extractor {
    constructor() {
        super()
    }

    async setDir(directoryHandle) {
        this.directoryHandle = directoryHandle
    }

    async extractMetadata(file) {
        this.file = file

        // wasm will use this link
        window.myApp = this

        await super.extractMetadata(file)
    }

    async notifyCompletion(result) {
        await super.notifyCompletion(result)
    }

    async extract() {
        for (let i = 0; i < this.Metadata.length; i++) {
            // console.log(JSON.stringify(this.Metadata[i]))

            let fileInfo = this.Metadata[i]
            const blob = await this.file.slice(fileInfo.Offset, fileInfo.Offset + fileInfo.Len);
            // Ensure the directory path exists
            const subPath = fileInfo.Name.substring(0, fileInfo.Name.lastIndexOf('/'));
            const targetDirectoryHandle = await this.ensureDirectoryHandle(this.directoryHandle, subPath);

            // Extract the file name from the path
            const fileName = fileInfo.Name.substring(fileInfo.Name.lastIndexOf('/') + 1);

            // Save the blob to the file
            await this.saveBlobToFile(blob, fileName, targetDirectoryHandle);
        }

        logMessage(`EXTRACTION IS DONE`);
    }


    async saveBlobToFile(blob, fileName, directoryHandle) {
        try {
            // Create a new file handle.
            const fileHandle = await directoryHandle.getFileHandle(fileName, {create: true});
            // Create a writable stream to write to the file.
            const writable = await fileHandle.createWritable();
            // Write the blob to the file.
            await writable.write(blob);
            // Close the file.
            await writable.close();
            logMessage(`File written: ${fileName}`);
        } catch (err) {
            console.error(`Could not write file: ${fileName}`, err);
        }
    }

    async ensureDirectoryHandle(directoryHandle, subPath) {
        const names = subPath.split('/').filter(p => p.length > 0); // Remove empty segments
        let currentHandle = directoryHandle;
        for (const name of names) {
            currentHandle = await currentHandle.getDirectoryHandle(name, {create: true});
        }
        return currentHandle;
    }


}

class FileApi extends Extractor {
    constructor(onMetadataSuccess, onExtractionSuccess) {
        super()
        this.onMetadataSuccess = onMetadataSuccess
        this.onExtractionSuccess = onExtractionSuccess
    }

    ZipGroups = null;

    ZipSize = 250 * 1024 * 1024

    workers = [];

    async extractMetadata(file) {
        this.file = file

        // wasm will use this link
        window.myApp = this

        await super.extractMetadata(file)
    }


    async notifyCompletion(result) {
        await super.notifyCompletion(result)
        this.ZipGroups = await this.groupBySubdirectory(this.Metadata, this.ZipSize)
        logMessage(`The content will be extracted to ${this.ZipGroups.length} zip files`)

        this.onMetadataSuccess()
    }

    async extract() {
        console.time("extract");
        let zipIndex = 0; // To enumerate ZIP files
        var zip = new JSZip();

        const saveAndResetZip = async () => {
            logMessage(`Preparing zip can take some time.`)
            logMessage(`Finalizing ZIP ${zipIndex}...`);
            let lastPercent = 0;
            const content = await zip.generateAsync({
                    type: "blob",
                    compression: "STORE"
                }, function updateCallback(metadata) {
                    // Check if the current percentage is different from the last reported
                    if (metadata.percent.toFixed() !== lastPercent.toFixed()) {
                        lastPercent = metadata.percent
                        // Update progress
                        let msg = "Progression zip " + zipIndex + ": " + metadata.percent.toFixed(2) + " %";
                        if (metadata.currentFile) {
                            msg += "\t" + metadata.currentFile;
                        }
                        logMessage(msg);
                    }
                }
            );
            await this.saveBlobToFileD(content, `extracted_${zipIndex}.zip`);
            zipIndex++;
            zip = new JSZip(); // Reset for next ZIP
        };

        // Create worker for each group and put them in the array
        this.ZipGroups.forEach((group, index) => {
            const worker = new Worker('web_resources/worker.js');
            worker.name = `Worker-${index}`;
            this.workers.push(worker);
        });



        glog.error(this.ZipGroups)
        // Post tasks to corresponding worker
        for (let j = 0; j < this.ZipGroups.length; j++) {
            for (let k = 0; k < this.ZipGroups[j].length; k++) {
                let arr = this.ZipGroups[j][k].entries
                for (let i = 0; i < arr.length; i++) {
                    let fileInfo = arr[i];
                    const blob = await this.readBlobFromFileD(this.file, fileInfo.Offset, fileInfo.Len);

                    // Post message to worker
                    this.workers[j].postMessage({
                        action: 'addTask',
                        payload: {
                            filename: fileInfo.Name,
                            data: blob
                        }
                    });
                }
            }

            this.workers[j].postMessage({
                action: 'finalize',
                payload: {
                    index: j,
                }
            });
        }

        // Wait for all workers to finish their work.
        await Promise.all(this.workers.map(worker => new Promise((resolve) => {
            worker.onmessage = (e) => {
                if (e.data.status === 'done') {
                    console.log(`Extraction completed by ${worker.name}`);
                    resolve();
                }
            };
        })));
        this.onExtractionSuccess()
        logMessage(`EXTRACTION IS DONE`);
        console.timeEnd("extract");
    }


    async readBlobFromFileD(file, offset, length) {
        // Get a file object from the file handle
        // Slice the file to get the blob
        const blob = file.slice(offset, offset + length);
        return blob;
    }


    async saveBlobToFileD(blob, fileName) {
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a temporary <a> element and set its href to the blob URL
        const a = document.createElement("a");
        document.body.appendChild(a); // Append the link to the body
        a.style = "display: none"; // Hide the link
        a.href = url;
        a.download = fileName; // Set the file name for download

        // Programmatically click the link to trigger the download
        a.click();

        // Clean up by revoking the blob URL and removing the link
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        logMessage(`File saved: ${fileName}`);
    }


    async groupBySubdirectory(entries, maxSizeInBytes = 250 * 1024 * 1024) {
        const groups = {};

        entries.forEach(entry => {
            const subPath = entry.Name.substring(0, entry.Name.lastIndexOf('/'));

            // Check if the group already exists
            if (!groups[subPath]) {
                // Initialize the group with an entries array, a subPath, and a totalSize counter
                groups[subPath] = {subPath: subPath, entries: [], totalSize: 0};
            }

            // Add the entry to the group's entries array
            groups[subPath].entries.push(entry);
            // Add the entry's size to the group's totalSize counter
            groups[subPath].totalSize += entry.Len;
        });

        // Convert groups object to an array of group objects
        let groupsArray = Object.values(groups);


        // Sort the array by subPath
        groupsArray.sort((a, b) => a.subPath.localeCompare(b.subPath));

        let chunks = [];
        let currentChunk = [];
        let currentChunkSize = 0;
        groupsArray.forEach(group => {
            // Check if adding this group would exceed the max size
            if (currentChunkSize + group.totalSize > maxSizeInBytes) {
                // If so, push the current chunk to chunks array and start a new chunk
                chunks.push(currentChunk);
                currentChunk = [];
                currentChunkSize = 0;
            }

            // Add the group to the current chunk and update the size
            currentChunk.push(group);
            currentChunkSize += group.totalSize;
        });
        if (currentChunk.length !== 0) {
            chunks.push(currentChunk);
        }
        return chunks;
    }


}

function logError(message) {
    logMessage(message);
}


window.glog = {
    error: function (result) {
        console.log(result)
    }
}
