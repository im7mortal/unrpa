interface FileSystemHandle {
    kind: string;
    name: string;
    queryPermission(opts: any): Promise<PermissionState>;
    requestPermission(opts: any): Promise<PermissionState>;
}

interface FileSystemFileHandle extends FileSystemHandle {
    getFile(): Promise<File>;
}

interface FilePickerOptions {
    types?: Array<{ description: string, accept: { [mimetype: string]: Array<string> } }>;
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
}

interface Window {
    showOpenFilePicker(opts?: FilePickerOptions) : Promise<Array<FileSystemFileHandle>>;
}

interface HTMLElement {
    showOpenFilePicker(opts?: FilePickerOptions) : Promise<Array<FileSystemFileHandle>>;
}