import React, {FC, MouseEvent} from 'react';
import {v4 as uuidv4} from 'uuid';
import {
    FileSystemAccessApi,
    FileSystemAccessApiInterface,
    scanDir,
    getIter,
    fileExtractionCreator
} from './detectVersion';
import {MetadataResponse} from "./unrpaLib/unrpaLibTypes"

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
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'RPA files',
                    accept: {
                        'text/rpa': ['.rpa']
                    }
                }]
            });
            const file = await fileHandle.getFile();
            let fs: FileSystemAccessApiInterface = new FileSystemAccessApi((s: string, logLevel: number) => void {})

            const callback = () => {
                onFileSelected({
                        Fs: fs,
                        FileName: file.name,
                        Id: uuidv4()
                    }
                )
            }


            let resp: MetadataResponse = await fs.extractMetadata(file, callback);
            if (resp.Error !== "") {
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
            Select archive
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
                    const iterator = scanDir(getIter(await window.showDirectoryPicker()), (s: string, logLevel: number) => {
                    }, fileExtractionCreator(false, (s: string, logLevel: number) => {
                    }), onFileSelected);
                    for await (const file of iterator) {
                        // duplicate waiting?
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