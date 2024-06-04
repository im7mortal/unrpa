import React, {FC, MouseEvent} from 'react';
import {v4 as uuidv4} from 'uuid';
import {
    FileSystemAccessApi,
    FileSystemAccessApiInterface,
    MetadataResponse,
    scanDir,
    getIter,
    fileExtractionCreator
} from './detectVersion';

interface FilePickerProps {
    onFileSelected: (fileExtraction: FileExtraction) => void;
}


export interface FileExtraction {
    Fs: FileSystemAccessApiInterface;
    FileName: string;
    Id: string;
}

export const FilePicker: FC<FilePickerProps> = ({onFileSelected}) => {

    const chooseFile = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            let [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            let fs: FileSystemAccessApiInterface = new FileSystemAccessApi((s: string, logLevel: number) => void {})
            let resp: MetadataResponse = await fs.extractMetadata(file);
            if (resp.Error === "") {
                onFileSelected({
                        Fs: fs,
                        FileName: file.name,
                        Id: uuidv4()
                    }
                )

            } else {
                console.log(resp.Error);
            }

        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {

            } else {
                // Handle any other errors
                console.error(err);
            }
        }
    };


    return (
        <button className="btn btn-primary me-3" onClick={chooseFile}>
            Select archiveLOL
        </button>
    );
};

export const DirectoryScanner: FC<FilePickerProps> = ({onFileSelected}) => {

    const scan = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            if (window.showDirectoryPicker) {
                try {
                    console.time("SCAN 1 WORKER")
                    const iterator = scanDir(getIter(await window.showDirectoryPicker()), (s: string, logLevel: number) => { }, fileExtractionCreator(false, (s: string, logLevel: number) => {}));
                    let fileArray: FileExtraction[] = [];
                    for await (const file of iterator) {
                        onFileSelected(file);
                    }
                    console.timeEnd("SCAN 1 WORKER")
                } catch (err) {
                    if (err instanceof DOMException && err.name === 'AbortError') {
                        console.log('Directory picker was cancelled');
                    } else {
                        // Handle any other errors
                        console.error(err);
                    }
                }
            } else {
                console.log('Directory picker is not supported in this browser');
            }


        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {

            } else {
                // Handle any other errors
                console.error(err);
            }
        }
    };


    return (
        <button className="btn btn-primary" onClick={scan}>Scan
            directory
        </button>
    );
};