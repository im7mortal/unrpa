async function readBlobFromFile(fileHandle, offset, length) {
    // Get a file object from the file handle
    const file = await fileHandle.getFile();
    // Slice the file to get the blob
    const blob = file.slice(offset, offset + length);
    return blob;
}

function logMessage(message) {
    // BAD IMPLEMENTATION BUT OK FOR NOW
    const logElement = document.getElementById('log');
    logElement.textContent += message + '\n'; // Append new message
    logElement.scrollTop = logElement.scrollHeight; // Auto-scroll to the bottom
}

function setButtonDisabled(id) {
    const button = document.getElementById(id);
    button.disabled = true;
    button.classList.remove('button-blue', 'button-green');
}

function setButtonActiveBlue(id) {
    const button = document.getElementById(id);
    button.disabled = false;
    button.classList.remove('button-green');
    button.classList.add('button-blue');
}

function setButtonActiveGreen(id) {
    const button = document.getElementById(id);
    button.disabled = false;
    button.classList.remove('button-blue');
    button.classList.add('button-green');
}

async function saveBlobToFile(blob, fileName, directoryHandle) {
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

async function ensureDirectoryHandle(directoryHandle, subPath) {
    const names = subPath.split('/').filter(p => p.length > 0); // Remove empty segments
    let currentHandle = directoryHandle;
    for (const name of names) {
        currentHandle = await currentHandle.getDirectoryHandle(name, {create: true});
    }
    return currentHandle;
}


async function run(arr, directoryHandle, fileHandle) {
    for (let i = 0; i < arr.length; i++) {
        // console.log(JSON.stringify(arr[i]))

        let fileInfo = arr[i]
        const blob = await readBlobFromFile(fileHandle, fileInfo.Offset, fileInfo.Len);
        // Ensure the directory path exists
        const subPath = fileInfo.Name.substring(0, fileInfo.Name.lastIndexOf('/'));
        const targetDirectoryHandle = await ensureDirectoryHandle(directoryHandle, subPath);

        // Extract the file name from the path
        const fileName = fileInfo.Name.substring(fileInfo.Name.lastIndexOf('/') + 1);

        // Save the blob to the file
        await saveBlobToFile(blob, fileName, targetDirectoryHandle);
    }

    logMessage(`EXTRACTION IS DONE`);
}

let directoryHandle = null;
let fileHandle = null;

let METADATA = null;
let ZIPGROUPS = null;

function isReadyToExtract() {
    document.getElementById('start').disabled = !(directoryHandle !== null && fileHandle !== null);
}

async function chooseDirectory() {
    directoryHandle = await window.showDirectoryPicker();
    setButtonActiveGreen("dirrPick")
    setButtonActiveBlue("start")
}

async function chooseFile() {
    [fileHandle] = await window.showOpenFilePicker();

    // Get a file object from the file handle
    const file = await fileHandle.getFile();
    accessApiStart(file)
    // button states must be here; but I want to keep it where error processing happen
    // ANYWAY THAT LOGIC IS BROKEN ; IT"S USER PROBLEMS FOR NOW
}

function logError(message) {
    logMessage(message);
}

function isV1(fileName) {
    return fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase() === 'rpi'
}

function isV2(length) {
    return length === 2
}

const v3String = "RPA-3.0"

function isV3(v) {
    return v === v3String
}

async function startProcess() {

    run(METADATA, directoryHandle, fileHandle)
    setButtonActiveGreen("start")
}

async function accessApiStart(file) {


    // The header size is around 33 bytes. We will check 100
    const chunkSize = 100;
    const blob = file.slice(0, chunkSize);
    const textChunk = await blob.text();

    let res = await parseHeader(file.name, textChunk)
    if (res === undefined) {
        return
    }
    let offsetNumber = res[0];
    let keyNumber = res[1];
    console.log(offsetNumber, keyNumber)
    const blobSlice = file.slice(offsetNumber);

    parseMetadata(blobSlice, keyNumber)


}

async function parseHeader(filename, headerString) {
    try {
        logMessage("Analyze \"" + filename + "\"")
        if (isV1(filename)) {
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

        if (isV2(parts.length)) {
            logError("Looks like it's RPA-2.0 format which is not supported");
            return;
        }

        let offsetParse = stringToBigInt(parts[1]);
        let keyParse = stringToBigInt(parts[2]);
        if (!offsetParse[1] || !keyParse[1]) {
            console.log("Is it RPA file? The archive header has errors");
            logError("Is it RPA file? The archive has errors");
            return
        }

        const offsetNumber = offsetParse[0];
        const keyNumber = keyParse[0];

        if (!isV3(parts[0])) {
            logError("Is it RPA file? It doesn't match to any RPA version");
            return
        } else {
            logMessage("Detected version " + v3String)
        }
        return [offsetNumber, keyNumber]

    } catch (error) {
        console.log("Error processing file " + error);
        logError("Is it RPA file? The archive has errors");
    }
}

async function parseMetadata(metadataSrc, keyNumber) {
    try {

        const reader = new FileReader();
        reader.onload = async function (e) {
            const arrayBuffer = e.target.result;
            const bytes = new Uint8Array(arrayBuffer);

            // Now, bytes can be sent to the WASM module
            await sendBytesToWasm(bytes, keyNumber);
        };
        reader.readAsArrayBuffer(metadataSrc);
        window.myApp = {
            notifyCompletion: function (result) {
                console.log(result)
                let arr = JSON.parse(result)
                logMessage("Successfully parsed metadata. " + arr.length + " files are ready to extraction")
                METADATA = arr;

                // 250 mb limit
                const zipSize = 250 * 1024 * 1024
                ZIPGROUPS = groupBySubdirectory(METADATA, zipSize)
                logMessage(`The content will be extracted to ${ZIPGROUPS.length} zip files`)
                // move from here
                setButtonActiveGreen("filePick")
                setButtonActiveBlue("dirrPick")
                setButtonDisabled("start")

            }
        }
    } catch (error) {
        console.log("Error processing file " + error);
        logError("Is it RPA file? The archive has errors");
    }
}


function isHexString(str) {
    // This regex matches a string that starts with "0x" or "0X" (optional)
    // followed by one or more hexadecimal characters (0-9, a-f, A-F).
    // The ^ and $ ensure the entire string matches this pattern.
    const regex1 = /^0x[0-9a-fA-F]+$/i;
    const regex2 = /^[0-9a-fA-F]+$/i;
    return regex1.test(str) || regex2.test(str);
}

function stringToBigInt(hexString) {

    if (!isHexString(hexString)) {
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

window.glog = {
    error: function (result) {
        console.log(result)
    }
}

async function readBlobFromFileD(file, offset, length) {
    // Get a file object from the file handle
    // Slice the file to get the blob
    const blob = file.slice(offset, offset + length);
    return blob;
}


function saveBlobToFileD(blob, fileName) {
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


function groupBySubdirectory(entries, maxSizeInBytes = 250 * 1024 * 1024) {
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


async function runForOld(zipGroup, file) {
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
        saveBlobToFileD(content, `extracted_${zipIndex}.zip`);
        zipIndex++;
        zip = new JSZip(); // Reset for next ZIP
    };

    for (let j = 0; j < zipGroup.length; j++) {
        for (let k = 0; k < zipGroup[j].length; k++) {
            let arr = zipGroup[j][k].entries
            for (let i = 0; i < arr.length; i++) {
                let fileInfo = arr[i];
                const blob = await readBlobFromFileD(file, fileInfo.Offset, fileInfo.Len);
                const subPath = fileInfo.Name.substring(0, fileInfo.Name.lastIndexOf('/'));

                let folder = zip.folder(subPath);

                // Extract the file name from the path
                const fileName = fileInfo.Name.substring(fileInfo.Name.lastIndexOf('/') + 1);
                folder.file(fileName, blob);

            }
        }
        await saveAndResetZip();
    }

    setButtonActiveGreen("startD");
    logMessage(`EXTRACTION IS DONE`);
}

