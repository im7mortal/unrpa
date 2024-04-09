declare var JSZip: any;

class Extractor {
    v3String: string = "RPA-3.0";
    Metadata: any = null;
    logMessage: Function;
    sendBytesToWasm: Function;

    constructor(logMessage: Function, sendBytesToWasm: Function) {
        this.logMessage = logMessage
        this.sendBytesToWasm = sendBytesToWasm
    }

    isV1(fileName: string): boolean {
        return fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase() === 'rpi'
    }

    isV2(length: number): boolean {
        return length === 2
    }

    isV3(v: string): boolean {
        return v === this.v3String
    }

    async parseHeader(filename: string, headerString: string): Promise<[number, number, number]> {
        let fail = [0, 0, 0]

        try {
            this.logMessage(`Analyze "${filename}"`);
            if (this.isV1(filename)) {
                logError("The RPA-1.0 which has extension '.rpi' is not supported");
                return fail
            }

            const firstLineEndIndex = headerString.indexOf('\n');
            if (firstLineEndIndex === -1) {
                console.log("Is it RPA format? The first 100 bytes do not contain a newline character.");
                logError("Is it RPA file? The archive has errors");
                return fail
            }
            const firstLine = headerString.substring(0, firstLineEndIndex >= 0 ? firstLineEndIndex : headerString.length);
            console.log(firstLine);

            const lines = firstLine.split('\n');
            const header = lines[0];
            const parts = header.split(' ');

            if (parts.length < 2 || parts.length > 4) {
                console.log("Is it RPA file? Number of header components doesn't match to any format")
                logError("Is it RPA file? The archive has errors");
                return fail
            }

            if (this.isV2(parts.length)) {
                logError("Looks like it's RPA-2.0 format which is not supported");
                return fail
            }
            console.log("HERE ",parts[1], parts[2])
            let offsetParse = this.stringToBigInt(parts[1]);
            let keyParse = this.stringToBigInt(parts[2]);
            console.log("HERE ", offsetParse, keyParse)
            if (!offsetParse[1] || !keyParse[1]) {
                console.log("Is it RPA file? The archive header has errors");
                logError("Is it RPA file? The archive has errors");
                return fail
            }

            const offsetNumber = offsetParse[0];
            const keyNumber = keyParse[0];

            if (!this.isV3(parts[0])) {
                logError("Is it RPA file? It doesn't match to any RPA version");
                return fail
            } else {
                this.logMessage("Detected version " + this.v3String)
            }

            return [1, Number(offsetNumber), Number(keyNumber)]

        } catch (error) {
            console.log("Error processing file " + error);
            logError("Is it RPA file? The archive has errors");
        }
        return fail
    }

    async parseMetadata(metadataSrc: any, keyNumber: number): Promise<void> {
        try {
            const reader = new FileReader();
            reader.onload = async (e: any): Promise<void> => {
                const arrayBuffer = e.target.result;
                const bytes = new Uint8Array(arrayBuffer);
                await this.sendBytesToWasm(bytes, keyNumber);
            };
            reader.readAsArrayBuffer(metadataSrc);
        } catch (error) {
            console.log("Error processing file " + error);
            logError("Is it RPA file? The archive has errors");
        }
    }

    async extractMetadata(file: File) {
        const chunkSize = 100;
        const blob = file.slice(0, chunkSize);
        const textChunk = await blob.text();

        let res: [number, number, number] = await this.parseHeader(file.name, textChunk)
        if (res[0] === 0) {
            return
        }
        let offsetNumber: number = res[1];
        let keyNumber = res[0];

        const blobSlice: Blob = file.slice(offsetNumber);

        await this.parseMetadata(blobSlice, keyNumber)
    }

    async notifyCompletion(result: string) {
        this.Metadata = JSON.parse(result);
        this.logMessage("Successfully parsed metadata. " + this.Metadata.length + " files are ready to extraction")
    }

    isHexString(str: string) {
        const regex1 = /^0x[0-9a-fA-F]+$/i;
        const regex2 = /^[0-9a-fA-F]+$/i;
        return regex1.test(str) || regex2.test(str);
    }

    stringToBigInt(hexString: string): [number, boolean] {
        if (!this.isHexString(hexString)) {
            console.log(`"${hexString}" is not hex string`);
            return [0, false]
        }

        if (hexString.length % 2 !== 0) {
            console.error("Hex string must have an even length");
            return [0, false]
        }

        const n: number = Number(BigInt("0x" + hexString));

        return [n, true];
    }
}

class FileSystemAccessApi extends Extractor {
    directoryHandle: any;
    file: File;

    onExtractionSuccess: Function;
    onMetadataSuccess: Function;
    logMessage: Function;

    constructor(logMessage: Function, sendBytesToWasm: Function, onMetadataSuccess: Function, onExtractionSuccess: Function) {
        super(logMessage, sendBytesToWasm)
        this.logMessage = logMessage
        this.onExtractionSuccess = onExtractionSuccess
        this.onMetadataSuccess = onMetadataSuccess
    }

    async setDir(directoryHandle: any) {
        this.directoryHandle = directoryHandle
    }

    async extractMetadata(file: File) {
        this.file = file
        window.myApp = this
        await super.extractMetadata(file)
    }

    async notifyCompletion(result: string) {
        await super.notifyCompletion(result)
    }

    async extract() {
        for (let i = 0; i < this.Metadata.length; i++) {
            let fileInfo = this.Metadata[i]
            console.log(fileInfo)
            const blob = await this.file.slice(fileInfo.Offset, fileInfo.Offset + fileInfo.Len);
            console.log(blob.size)
            const subPath = fileInfo.Name.substring(0, fileInfo.Name.lastIndexOf('/'));
            const targetDirectoryHandle = await this.ensureDirectoryHandle(this.directoryHandle, subPath);
            const fileName = fileInfo.Name.substring(fileInfo.Name.lastIndexOf('/') + 1);
            await this.saveBlobToFile(blob, fileName, targetDirectoryHandle);
        }

        this.logMessage(`EXTRACTION IS DONE`);
    }

    async saveBlobToFile(blob: Blob, fileName: string, directoryHandle: any) {
        try {
            const fileHandle = await directoryHandle.getFileHandle(fileName, {create: true});
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            this.logMessage(`File written: ${fileName}`);
        } catch (err) {
            console.error(`Could not write file: ${fileName}`, err);
        }
    }

    async ensureDirectoryHandle(directoryHandle: any, subPath: string) {
        const names = subPath.split('/').filter(p => p.length > 0);
        let currentHandle = directoryHandle;
        for (const name of names) {
            currentHandle = await currentHandle.getDirectoryHandle(name, {create: true});
        }
        return currentHandle;
    }

    async* iterateDirectory(dirHandle: FileSystemDirectoryHandle) {
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file') {
                yield entry;
            } else {
                yield* this.iterateDirectory(entry);
            }
        }
    }

    async scanDir(dirHandle: FileSystemDirectoryHandle) {
        const files: File[];
        for await (const fileHandle: FileSystemFileHandle of this.iterateDirectory(dirHandle)) {
            const fileName = fileHandle.name;
            console.log(fileName)
            if (fileName.endsWith('.rpa')) {
                const file = await fileHandle.getFile();
                files.push(file);
            }
        }
        return files;
    }
}

class FileApi extends Extractor {
    ZipGroups: any = null;
    ZipSize: number = 250 * 1024 * 1024;
    workers: any = [];
    file: File;

    onExtractionSuccess: Function;
    onMetadataSuccess: Function;
    logMessage: Function;

    constructor(logMessage: Function, sendBytesToWasm: Function, onMetadataSuccess: Function, onExtractionSuccess: Function) {
        super(logMessage, sendBytesToWasm)
        this.logMessage = logMessage
        this.onExtractionSuccess = onExtractionSuccess
        this.onMetadataSuccess = onMetadataSuccess
    }

    async extractMetadata(file: File) {
        this.file = file
        window.myApp = this
        await super.extractMetadata(file)
    }

    async notifyCompletion(result: string) {
        await super.notifyCompletion(result)
        this.ZipGroups = await this.groupBySubdirectory(this.Metadata, this.ZipSize)
        this.logMessage(`The content will be extracted to ${this.ZipGroups.length} zip files`)
        this.onMetadataSuccess()
    }

    async extract() {
        console.time("extract");
        let zipIndex = 0;
        var zip = new JSZip();

        const saveAndResetZip = async () => {
            this.logMessage(`Preparing zip can take some time.`)
            this.logMessage(`Finalizing ZIP ${zipIndex}...`);
            let lastPercent = 0;
            const content = await zip.generateAsync({
                    type: "blob",
                    compression: "STORE"
                }, function updateCallback(metadata: any) {
                    if (metadata.percent.toFixed() !== lastPercent.toFixed()) {
                        lastPercent = metadata.percent
                        let msg = "Progression zip " + zipIndex + ": " + metadata.percent.toFixed(2) + " %";
                        if (metadata.currentFile) {
                            msg += "\t" + metadata.currentFile;
                        }
                        this.logMessage(msg);
                    }
                }
            );
            await this.saveBlobToFileD(content, `extracted_${zipIndex}.zip`);
            zipIndex++;
            let zip = new JSZip();
        };

        const maxWorkers = 4;
        this.logMessage("create workers")
        const workers = Array.from({length: maxWorkers}, (_, index) => {
            const worker: Worker = new Worker('web_resources/worker.js');
            // worker.name = `Worker-${index}`;
            return worker;
        });
        this.logMessage("workers created")

        let busyWorkers = new Array(maxWorkers).fill(false);

        workers.forEach((worker, index) => {
            worker.onmessage = (e: any) => {

                if (e.data.status === 'finished') {
                    this.logMessage("ITS DNE MESSAG")
                    // this.logMessage(`${worker.name} is free!`);
                    busyWorkers[index] = false;
                    this.saveBlobToFileD(e.data.content, `extracted_${e.data.zipIndex}.zip`)
                    this.logMessage("saved")
                }

                if (e.data.status === 'progress') {
                    this.logMessage(e.data.content)
                }

            }
        });

        async function getFreeWorker() {
            let index = busyWorkers.indexOf(false);
            while (index === -1) {
                await new Promise(resolve => setTimeout(resolve, 10));
                index = busyWorkers.indexOf(false);
            }
            busyWorkers[index] = true;
            return index;
        }

        let indZip = 0;
        for (let group of this.ZipGroups) {
            this.logMessage("STARTED NEW GROUP")
            const workerIndex = await getFreeWorker();
            for (let subGroup of group) {
                for (let entry of subGroup.entries) {
                    let blob = await this.readBlobFromFileD(this.file, entry.Offset, entry.Len);
                    workers[workerIndex].postMessage({
                        action: 'addTask',
                        payload: {
                            filename: entry.Name,
                            data: blob,
                        }
                    });
                }
            }
            workers[workerIndex].postMessage({
                action: 'finalize', zipIndex: indZip
            });
            indZip++;
        }

        async function waitForAllWorkersFree() {
            while (busyWorkers.some(value => value === true)) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            console.log('All workers are free!');
        }

        await waitForAllWorkersFree()

        this.onExtractionSuccess()

        this.logMessage(`EXTRACTION IS DONE`);
        console.timeEnd("extract");
    }

    async readBlobFromFileD(file: File, offset: number, length: number) {
        const blob = file.slice(offset, offset + length);
        return blob;
    }

    async saveBlobToFileD(content: Blob, fileName: string) {
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.logMessage(`File saved: ${fileName}`);
    }

    async groupBySubdirectory(entries: any, maxSizeInBytes: number = 250 * 1024 * 1024) {
        const groups: { [key: string]: any } = {};

        entries.forEach((entry: any) => {
            const subPath = entry.Name.substring(0, entry.Name.lastIndexOf('/'));

            if (!groups[subPath]) {
                groups[subPath] = {subPath: subPath, entries: [], totalSize: 0};
            }

            groups[subPath].entries.push(entry);
            groups[subPath].totalSize += entry.Len;
        });

        const groupsArray: any[] = [];
        for (const key in groups) {
            if (groups.hasOwnProperty(key)) {
                groupsArray.push(groups[key]);
            }
        }

        groupsArray.sort((a: any, b: any) => a.subPath.localeCompare(b.subPath));

        let chunks: any[] = [];
        let currentChunk: any[] = [];
        let currentChunkSize = 0;
        groupsArray.forEach(group => {
            if (currentChunkSize + group.totalSize > maxSizeInBytes) {
                chunks.push(currentChunk);
                currentChunk = [];
                currentChunkSize = 0;
            }

            currentChunk.push(group);
            currentChunkSize += group.totalSize;
        });
        if (currentChunk.length !== 0) {
            chunks.push(currentChunk);
        }
        return chunks;
    }
}

function logError(message: string): void {
    this.logMessage(message);
}

declare global {
    interface Window {
        glog: any;
        myApp: any;
    }
}

window.glog = {
    error: function (result: any) {
        console.log(result)
    }
}