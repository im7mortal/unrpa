import {v4 as uuidv4} from 'uuid';

import MetaWorker from './workers/metadataParser.worker?worker&url'
import ZipWorker from './workers/zipper.worker?worker&url'

import {FileHeader, MetadataResponse} from "./unrpaLib/unrpaLibTypes"

import {logLevelFunction, LogLevel} from './logInterface';

import workerpool from 'workerpool';
import {groupBySubdirectory, GroupFilesFunction, GroupZipSort} from "./unrpaLib/unrpaGroupFunction";


class WorkerPool {
    private static instance: WorkerPool;
    private pool: workerpool.Pool;
    private maxWorkers: number = 4;

    private constructor() {
        this.pool = workerpool.pool(MetaWorker, { maxWorkers: this.maxWorkers });
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
    register: (f: (file: File, group: FileHeader[]) => void) => void;
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
        console.time("extract_access");
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
        console.timeEnd("extract_access")
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
    register(f: (file: File, group: FileHeader[]) => void) {
        f(this.file, this.Metadata)
    }
}


class WorkerPoolZipper {
    private static instance: WorkerPoolZipper;
    private pool: workerpool.Pool;
    private maxWorkers: number = 4;

    private constructor() {
        this.pool = workerpool.pool(ZipWorker, {maxWorkers: this.maxWorkers});
    }

    public static getInstance(): WorkerPoolZipper {
        if (!WorkerPoolZipper.instance) {
            WorkerPoolZipper.instance = new WorkerPoolZipper();
        }

        return WorkerPoolZipper.instance;
    }

    public async addTask(file: File, group: GroupZipSort[], zipIndex: number): Promise<ZipWorkerOut> {
        try {
            return await this.pool.exec('zip', [file, group, zipIndex]);
        } catch (error) {
            console.error('Error executing task:', error);
            throw 'Error executing task:' + error // TODO
        }
    }
}


export class FileApi extends Extractor implements FClassInterface {
    ZipGroups: GroupZipSort[][] = [];
    ZipSize: number = 250 * 1024 * 1024;
    Metadata: FileHeader[] = [];
    workers: any = [];
    file!: File;
    canceled: boolean = false
    cancelExtraction: (() => void) | null = null;

    logMessage: logLevelFunction;
    groupFunc: GroupFilesFunction;
    private workerPoolZ: WorkerPoolZipper;


    constructor(file: File, logMessage: logLevelFunction, groupFunc: GroupFilesFunction = groupBySubdirectory) {
        super(logMessage)
        this.file = file
        this.logMessage = logMessage
        this.groupFunc = groupFunc
        this.workerPoolZ = WorkerPoolZipper.getInstance();
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
        console.log(metadata)

        if (metadata.Error === "") {
            this.Metadata = metadata.FileHeaders
        }

        this.ZipGroups = this.groupFunc(this.Metadata, this.ZipSize)
        console.log(this.ZipGroups)
        this.logMessage(`The content will be extracted to ${this.ZipGroups.length} zip files`, LogLevel.Info)
        return metadata
    }

    async extract() {
        console.time("extract");
        let self = this;
        const tasks: Promise<any>[] = [];
        let n: number = 0;
        for (let group of this.ZipGroups) {
            n++ // we start from 1; as this software intended not for programmers; index will be used in the filename

            const taskPromise = self.workerPoolZ.addTask(self.file, group, n)
                .then(result => {
                    self.saveBlobToFileD(result.content, `extracted_${result.zipIndex}.zip`)
                    this.logMessage("saved", LogLevel.Info)
                })
                .catch(error => {
                    console.error('Task failed:', error);
                });
            tasks.push(taskPromise);
        }
        await Promise.allSettled(tasks);

        this.logMessage(`EXTRACTION IS DONE`, LogLevel.Info);
        console.timeEnd("extract");
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
    register(f: (file: File, group: FileHeader[]) => void) {
        f(this.file, this.Metadata)
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

export interface ZipWorkerOut {
    content: Blob
    zipIndex: number
}
