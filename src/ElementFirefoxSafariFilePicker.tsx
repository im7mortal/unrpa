import React, {FC, MouseEvent, useRef} from 'react';
import {v4 as uuidv4} from 'uuid';
import {
    FileExtraction,
    FileApi,
    FileSystemAccessApi,
    FileSystemAccessApiInterface, getIter,
    scanDir, fileExtractionCreator
} from './detectVersion';
import {useLogs} from "./LogProvider";

interface FilePickerProps {
    onFileSelected: (fileExtraction: FileExtraction) => void;
}

export const FilePickerF: FC<FilePickerProps> = ({onFileSelected}) => {
    const {recordLog} = useLogs();
    const inputRef = React.useRef<HTMLInputElement>(null);

    function chooseFile() {
        inputRef.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const ff = e.target.files[0]
            const f = new FileApi(recordLog)
            f.extractMetadata(ff, ()=>{
                onFileSelected({
                        Fs: f,
                        FileName: ff.name,
                        Id: uuidv4(),
                        Firefox: true,
                    }
                )
            })


        } else {
            alert('Please select a file.');
        }
    };

    return (
        <>
            <input type="file" style={{display: 'none'}} onChange={handleFileChange} ref={inputRef} accept=".rpa"/>
            <button className={`btn btn-primary me-3`} onClick={chooseFile}>
                Select archive
            </button>
        </>

    );
};


export const DirectoryScannerF: FC<FilePickerProps> = ({onFileSelected}) => {
    const {recordLog} = useLogs();
    const inputRef = React.useRef<HTMLInputElement>(null);

    function chooseFile() {
        inputRef.current?.click();
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const files = Array.from(e.target.files);
            try {
                const iterator = scanDir(getIter(e.target.files), (s: string, logLevel: number) => {
                }, fileExtractionCreator(true, (s: string, logLevel: number) => {}), onFileSelected);
                let fileArray: FileExtraction[] = [];
                for await (const file of iterator) {
                    onFileSelected(file);
                }
                // onFileSelected({
                //         Fs: new FileApi(recordLog),
                //         FileName: e.target.files[0].name,
                //         Id: uuidv4()
                //     }
                // )
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    console.log('Directory picker was cancelled');
                } else {

                    console.error(err);
                }
            }
        } else {
            alert('Please select a directory.');
        }
    };


    const getIter = function (files: FileList): () => AsyncGenerator<File, void, undefined> {
        return async function* (): AsyncGenerator<File, void, undefined> {
            for await (const file of files) {
                if (file.name.endsWith('.rpa')) {
                    yield file;
                }
            }
        }
    }


    return (
        <>
            <input type="file" style={{display: 'none'}} onChange={handleFileChange}
                   ref={inputRef}   {...({webkitdirectory: "true", directory: "true"} as any)}/>
            <button className={`btn btn-primary me-3`} onClick={chooseFile}>
                Scan DIRR
            </button>
        </>

    )
        ;
};