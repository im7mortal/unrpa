import {v4 as uuidv4} from 'uuid';

import {FileHeader, MetadataResponse} from "./unrpaLib/unrpaLibTypes"

import {logLevelFunction, LogLevel} from './logInterface';

import {WorkerUrl} from 'worker-url';
import workerpool from 'workerpool';


class WorkerPool {
    private static instance: WorkerPool;
    private pool: workerpool.Pool;
    private maxWorkers: number = 4;

    private constructor() {
        // webpack understand from this part that we need compile separate worker file from this .ts
        const WorkerURL = new WorkerUrl(new URL('./workers/metadataParser.worker.ts', import.meta.url))
        this.pool = workerpool.pool(WorkerURL.toString(), {maxWorkers: this.maxWorkers});
    }

    public static getInstance(): WorkerPool {
        if (!WorkerPool.instance) {
            WorkerPool.instance = new WorkerPool();
        }

        return WorkerPool.instance;
    }

    public async addTask(file: File): Promise<any> {
        try {
            return await this.pool.exec('extractMetadata', [file]);
        } catch (error) {
            console.error('Error executing task:', error);
        }
    }
}


export interface FClassInterface {
    extractMetadata: () => Promise<MetadataResponse>;
    extract: () => Promise<void>;
    cancel: () => Promise<void>;
}

export interface FileSystemAccessApiInterface extends FClassInterface {
    setDirectoryHandle?: (handle: FileSystemDirectoryHandle) => void;
}

class Extractor {
    private workerPool: WorkerPool;

    constructor(logMessage: logLevelFunction) {
        this.workerPool = WorkerPool.getInstance();
    }

    async extractMetadata(file: File, callback: () => void): Promise<MetadataResponse> {
        return this.workerPool.addTask(file)
    }
}

export class FileSystemAccessApi extends Extractor implements FileSystemAccessApiInterface {
    directoryHandle!: FileSystemDirectoryHandle;
    file!: File;
    Metadata: FileHeader[] = [];
    canceled: boolean = false

    logMessage: logLevelFunction;

    constructor(file: File, logMessage: logLevelFunction) {
        super(logMessage)
        this.file = file
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

    async extractMetadata(): Promise<MetadataResponse> {
        let metadata: MetadataResponse = await super.extractMetadata(this.file, () => {
        });
        if (metadata.Error === "") {
            this.Metadata = metadata.FileHeaders
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


    constructor(file: File, logMessage: logLevelFunction) {
        super(logMessage)
        this.file = file
        this.logMessage = logMessage
    }


    async cancel() {
        this.canceled = true
        if (this.cancelExtraction !== null) {
            this.cancelExtraction()
        }
    }

    async extractMetadata(): Promise<MetadataResponse> {

        this.logMessage(`Analyze "${this.file.name}"`, LogLevel.Info);
        let metadata: MetadataResponse = await super.extractMetadata(this.file, () => {
        })
        if (metadata.Error === "") {
            this.Metadata = metadata.FileHeaders
        }

        this.ZipGroups = this.groupBySubdirectory(this.Metadata, this.ZipSize)
        this.logMessage(`The content will be extracted to ${this.ZipGroups.length} zip files`, LogLevel.Info)
        return metadata
    }

    async extract() {
        let self = this;
        console.time("extract");


        const maxWorkers: number = 4;
        this.logMessage("create workers", LogLevel.Info)
        const workers = Array.from({length: maxWorkers}, (_, index) => {
            const worker: Worker = new Worker(new URL('./workers/zipper.worker.ts', import.meta.url));
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

    groupBySubdirectory(entries: any, maxSizeInBytes: number = 250 * 1024 * 1024) {
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
    Parsed: boolean,
    SizeMsg: string,
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function fileExtractionCreator(sys: boolean, logMessage: logLevelFunction): (file: File) => FileExtraction {
    return (file: File): FileExtraction => {
        let fs: FileSystemAccessApiInterface
        if (sys) {
            fs = new FileSystemAccessApi(file, logMessage);

        } else {
            fs = new FileApi(file, logMessage)
        }
        return {
            Fs: fs,
            FileName: file.name,
            Id: uuidv4(),
            Parsed: true,
            SizeMsg: formatBytes(file.size),
        }
    }
}

// TODO
// eslint-disable-next-line
export async function* scanDir(iterateDirectory: () => AsyncGenerator<File, void, undefined>, logMessage: logLevelFunction, factory: (file: File) => FileExtraction, onFileSelected: (newFiles: FileExtraction) => void): AsyncGenerator<FileExtraction, void, undefined> {
    let promises: Promise<MetadataResponse>[] = [];
    for await (const file of iterateDirectory()) {
        // TypeScript infers fileHandle as FileSystemFileHandle
        logMessage(file.name, LogLevel.Debug);
        if (file.name.endsWith('.rpa')) { // TODO duplicate
            let fs: FileExtraction = factory(file);
            fs.Parsed = false
            fs.SizeMsg = formatBytes(file.size);
            onFileSelected(fs)

            let metadataPromise: Promise<MetadataResponse> = fs.Fs.extractMetadata();
            promises.push(metadataPromise);
        }
    }

    const metadataResponses = await Promise.all(promises);
    for (const metadata of metadataResponses) {
        if (metadata.Error === "") {
            // yield fs;
        } else {
            logMessage(metadata.Error, LogLevel.Error);
            console.log(metadata.Error);
        }
    }
}