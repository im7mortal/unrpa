type FileSystemHandleKind = "file" | "directory";

interface FileSystemHandle {
    kind: FileSystemHandleKind;
    name: string;
    queryPermission(opts: any): Promise<PermissionState>;
    requestPermission(opts: any): Promise<PermissionState>;
    getDirectoryHandle?(name: string, options?: { create: boolean }): Promise<FileSystemDirectoryHandle>;
}

interface FileSystemFileHandle extends FileSystemHandle {
    getFile(): Promise<File>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
    values: () => AsyncIterable<FileSystemHandleEntry>;
}

interface FileSystemHandleEntry {
    kind: FileSystemHandleKind;
    name: string;
    isSameEntry: (entry: FileSystemHandle) => Promise<boolean>;
    queryPermission: (opts: any) => Promise<PermissionState>;
    requestPermission: (opts: any) => Promise<PermissionState>;
    getDirectoryHandle: (name: string) => Promise<FileSystemDirectoryHandle>;
}

interface FilePickerOptions {
    types?: Array<{ description: string, accept: { [mimetype: string]: Array<string> } }>;
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
}

interface Window {
    showOpenFilePicker(opts?: FilePickerOptions) : Promise<Array<FileSystemFileHandle>>;
    showDirectoryPicker?(opts?: {}): Promise<FileSystemDirectoryHandle>;
}

interface HTMLElement {
    showOpenFilePicker(opts?: FilePickerOptions) : Promise<Array<FileSystemFileHandle>>;
    showDirectoryPicker?(opts?: {}): Promise<FileSystemDirectoryHandle>;
}


// export { FileSystemHandle, FileSystemFileHandle, FileSystemDirectoryHandle, FileSystemHandleEntry, FilePickerOptions, SomeClass };