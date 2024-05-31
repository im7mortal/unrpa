import {v4 as uuidv4} from 'uuid';

import {logLevelFunction, LogLevel} from './logInterface';
import {Simulate} from "react-dom/test-utils";

export interface FClassInterface {
    extractMetadata: (file: File) => Promise<MetadataResponse>;
    extract: () => Promise<void>;
    cancel: () => Promise<void>;
}

export interface FileSystemAccessApiInterface extends FClassInterface {
    setDirectoryHandle?: (handle: FileSystemDirectoryHandle) => void;
}

interface FileHeader {
    Name: string
    Offset: number,
    Len: number
    Field: string // I don't know what is it
}

interface RPAHeader {
    offsetNumber: number,
    keyNumber: number
    Error: string,
}

function newRPAHeader(offsetNumber: number, keyNumber: number, err: string): RPAHeader {
    return {
        offsetNumber: offsetNumber,
        keyNumber: keyNumber,
        Error: err
    }
}

function failedRPAHeader(err: string): RPAHeader {
    return {
        offsetNumber: 0,
        keyNumber: 0,
        Error: err
    }
}

export interface MetadataResponse {
    FileHeaders: FileHeader[]
    Error: string,
}

function newMetadataResponse(FileHeaders: FileHeader[], err: string): MetadataResponse {
    return {
        FileHeaders: FileHeaders,
        Error: err
    }
}

class Extractor {
    v3String: string = "RPA-3.0";
    logMessage: logLevelFunction;

    constructor(logMessage: logLevelFunction) {
        this.logMessage = logMessage
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

    async parseHeader(filename: string, headerString: string): Promise<RPAHeader> {

        try {
            if (this.isV1(filename)) {
                console.log("The RPA-1.0 which has extension '.rpi' is not supported")
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }

            const firstLineEndIndex = headerString.indexOf('\n');
            if (firstLineEndIndex === -1) {
                console.log("Is it RPA format? The first 100 bytes do not contain a newline character.");
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }

            const firstLine = headerString.substring(0, firstLineEndIndex >= 0 ? firstLineEndIndex : headerString.length);
            const lines = firstLine.split('\n');
            const header = lines[0];
            const parts = header.split(' ');

            if (parts.length < 2 || parts.length > 4) {
                console.log("Is it RPA file? Number of header components doesn't match to any format")
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }

            if (this.isV2(parts.length)) {
                logError("Looks like it's RPA-2.0 format which is not supported");
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }
            let offsetParse = this.stringToBigInt(parts[1]);
            let keyParse = this.stringToBigInt(parts[2]);
            if (!offsetParse[1] || !keyParse[1]) {
                console.log("Is it RPA file? The archive header has errors");
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }

            const offsetNumber = offsetParse[0];
            const keyNumber = keyParse[0];

            if (!this.isV3(parts[0])) {
                logError("Is it RPA file? It doesn't match to any RPA version");
                return failedRPAHeader("Is it RPA file? The archive has errors")
            } else {
                this.logMessage("Detected version " + this.v3String, LogLevel.Info)
            }

            return newRPAHeader(Number(offsetNumber), Number(keyNumber), "")

        } catch (error) {
            console.log("Error processing file " + error);
        }
        return failedRPAHeader("Is it RPA file? The archive has errors")
    }

    async parseMetadata(metadataSrc: Blob, keyNumber: number): Promise<MetadataResponse> {
        try {
            // Wrap FileReader operation in a Promise
            const metadataString: string = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e: any): Promise<void> => {
                    try {
                        const worker: Worker = new Worker('metadataParser.js');
                        worker.onmessage = (e: any) => {
                            if (e.data.status === 'finished') {
                                resolve(e.data.content)
                            }
                        }
                        worker.postMessage({
                            action: 'addTask',
                            payload: {
                                keyNumber: keyNumber,
                                data: new Uint8Array(e.target.result),
                            }
                        })
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.readAsArrayBuffer(metadataSrc);
            });
            return JSON.parse(metadataString)

        } catch (error) {
            console.log("Error processing file " + error);
            return {
                FileHeaders: [],
                Error: "Is it RPA file? The archive has errors"
            }
        }
    }

    async extractMetadata(file: File): Promise<MetadataResponse> {
        const chunkSize = 100; // we assume that RPA header must fit in 100 bytes
        const headerBlob: Blob = file.slice(0, chunkSize);

        let rpaHead: RPAHeader = await this.parseHeader(file.name, await headerBlob.text());
        if (rpaHead.Error !== "") {
            return newMetadataResponse([], rpaHead.Error);
        }

        const metadataBlob: Blob = file.slice(rpaHead.offsetNumber);
        return this.parseMetadata(metadataBlob, rpaHead.keyNumber);

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

export class FileSystemAccessApi extends Extractor implements FileSystemAccessApiInterface {
    directoryHandle!: FileSystemDirectoryHandle;
    file!: File;
    Metadata: FileHeader[] = [];
    canceled: boolean = false

    logMessage: logLevelFunction;

    constructor(logMessage: logLevelFunction) {
        super(logMessage)
        this.logMessage = logMessage
    }

    async cancel() {
        this.canceled = true
    }

    setDirectoryHandle(handle: FileSystemDirectoryHandle) {
        this.directoryHandle = handle
        console.log(this.Metadata)
        console.log(this.directoryHandle)
    }

    async extractMetadata(file: File): Promise<MetadataResponse> {
        this.file = file
        let metadata: MetadataResponse = await super.extractMetadata(file)
        if (metadata.Error === "") {
            this.Metadata = metadata.FileHeaders
            console.log(this.Metadata)
        }
        return metadata
    }

    async ensureDirectoryHandle(directoryHandle: any, subPath: string) {
        const names = subPath.split('/').filter(p => p.length > 0);
        let currentHandle = directoryHandle;
        for (const name of names) {
            currentHandle = await currentHandle.getDirectoryHandle(name, {create: true});
        }
        return currentHandle;
    }

    async extract() {
        for (let i = 0; i < this.Metadata.length; i++) {
            if (this.canceled) {
                this.logMessage(`EXTRACTION IS CANCELED`, LogLevel.Info);
                return
            }
            let fileInfo = this.Metadata[i]
            console.log(fileInfo)
            const blob = await this.file.slice(fileInfo.Offset, fileInfo.Offset + fileInfo.Len);
            console.log(blob.size)
            const subPath = fileInfo.Name.substring(0, fileInfo.Name.lastIndexOf('/'));
            const targetDirectoryHandle = await this.ensureDirectoryHandle(this.directoryHandle, subPath);
            const fileName = fileInfo.Name.substring(fileInfo.Name.lastIndexOf('/') + 1);
            await this.saveBlobToFile(blob, fileName, targetDirectoryHandle);
        }

        this.logMessage(`EXTRACTION IS DONE`, LogLevel.Info);
    }

    async saveBlobToFile(blob: Blob, fileName: string, directoryHandle: any) {
        try {
            const fileHandle = await directoryHandle.getFileHandle(fileName, {create: true});
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            this.logMessage(`File written: ${fileName}`, LogLevel.Info);
        } catch (err) {
            console.error(`Could not write file: ${fileName}`, err);
        }
    }
}

export class FileApi extends Extractor implements FClassInterface {
    ZipGroups: any = null;
    ZipSize: number = 250 * 1024 * 1024;
    Metadata: FileHeader[] = [];
    workers: any = [];
    file!: File;
    canceled: boolean = false
    cancelExtraction: (() => void) | null = null;

    logMessage: logLevelFunction;


    constructor(logMessage: logLevelFunction) {
        super(logMessage)
        this.logMessage = logMessage
    }


    async cancel() {
        this.canceled = true
        if (this.cancelExtraction !== null) {
            this.cancelExtraction()
        }
    }

    async extractMetadata(file: File): Promise<MetadataResponse> {
        this.file = file

        this.logMessage(`Analyze "${file.name}"`, LogLevel.Info);
        let metadata: MetadataResponse = await super.extractMetadata(file)
        if (metadata.Error === "") {
            this.Metadata = metadata.FileHeaders
        }

        this.ZipGroups = await this.groupBySubdirectory(this.Metadata, this.ZipSize)
        this.logMessage(`The content will be extracted to ${this.ZipGroups.length} zip files`, LogLevel.Info)
        return metadata
    }

    async extract() {
        let self = this;
        console.time("extract");


        const maxWorkers: number = 4;
        this.logMessage("create workers", LogLevel.Info)
        const workers = Array.from({length: maxWorkers}, (_, index) => {
            const worker: Worker = new Worker('zipper.js');
            // worker.name = `Worker-${index}`;
            return worker;
        });
        this.logMessage("workers created", LogLevel.Info)

        let busyWorkers = new Array(maxWorkers).fill(false);

        this.cancelExtraction = () => {
            workers.forEach((worker, index) => {
                worker.terminate();
            })
        }

        workers.forEach((worker, index) => {
            worker.onmessage = (e: any) => {

                if (e.data.status === 'finished') {
                    this.logMessage("ITS DNE MESSAG", LogLevel.Info)
                    // this.logMessage(`${worker.name} is free!`);
                    busyWorkers[index] = false;
                    this.saveBlobToFileD(e.data.content, `extracted_${e.data.zipIndex}.zip`)
                    this.logMessage("saved", LogLevel.Info)
                }

                if (e.data.status === 'progress') {
                    this.logMessage(e.data.content, LogLevel.Info)
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
            this.logMessage("STARTED NEW GROUP", LogLevel.Info)
            const workerIndex = await getFreeWorker();
            for (let subGroup of group) {
                for (let entry of subGroup.entries) {
                    if (self.canceled) {
                        this.logMessage(`EXTRACTON CANCELED`, LogLevel.Info)
                        return
                    }
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
            while (busyWorkers.some(value => value === true) && !self.canceled) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            console.log('All workers are free!');
        }

        await waitForAllWorkersFree()

        if (self.canceled) {
            this.logMessage(`EXTRACTON CANCELED`, LogLevel.Info)
            return
        }
        this.logMessage(`EXTRACTION IS DONE`, LogLevel.Info);
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
        this.logMessage(`File saved: ${fileName}`, LogLevel.Info);
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
    console.log(message);
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

export interface FileExtraction {
    Id: string
    Fs: FileSystemAccessApiInterface
    FileName: string,
}


async function* iterateDirectory(dirHandle: FileSystemDirectoryHandle): AsyncGenerator<FileSystemHandle, void, undefined> {
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            yield entry;
        } else if (entry.kind === 'directory') {
            const dirEntry = entry as FileSystemDirectoryHandle;
            yield* iterateDirectory(dirEntry);
        }
    }
}

export async function scanDir(dirHandle: FileSystemDirectoryHandle, logMessage: logLevelFunction): Promise<FileExtraction[]> {
    let ff: FileExtraction[] = [];
    for await (const fileHandle of iterateDirectory(dirHandle)) {
        // TypeScript infers fileHandle as FileSystemFileHandle
        const fileName: string = fileHandle.name;
        logMessage(fileName, LogLevel.Debug)
        if (fileName.endsWith('.rpa')) {
            const file: File = await (fileHandle as FileSystemFileHandle).getFile();
            let fs: FileSystemAccessApiInterface = new FileSystemAccessApi(logMessage)
            let metadata: MetadataResponse = await fs.extractMetadata(file)
            if (metadata.Error === "") {
                ff.push({
                        Fs: fs,
                        FileName: fileName,
                        Id: uuidv4(),
                    }
                );
            } else {
                logMessage(metadata.Error, LogLevel.Error)
                console.log(metadata.Error);
            }
        }
    }
    return ff;
}
