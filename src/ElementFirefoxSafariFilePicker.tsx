import React, {FC, MouseEvent, useRef} from 'react';
import {v4 as uuidv4} from 'uuid';
import {
    FClassInterface,
    FileApi,
    FileSystemAccessApi,
    FileSystemAccessApiInterface,
    MetadataResponse, scanDir
} from './detectVersion';
import {useLogs} from "./LogProvider";

interface FilePickerProps {
    onFileSelected: (fileExtraction: FileExtraction) => void;
}


export interface FileExtraction {
    Fs: FileSystemAccessApiInterface;
    FileName: string;
    Id: string;
}

export const FilePickerF: FC<FilePickerProps> = ({onFileSelected}) => {
    const {recordLog} = useLogs();
    const inputRef = React.useRef<HTMLInputElement>(null);
    function chooseFile() {
        inputRef.current?.click();
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {

            onFileSelected({
                    Fs: new FileApi(recordLog),
                    FileName: e.target.files[0].name,
                    Id: uuidv4()
                }
            )

        } else {
            alert('Please select a file.');
        }
    };

    return (
        <>
            <input type="file" style={{display:'none'}} onChange={handleFileChange} ref={inputRef}/>
            <button className={`btn btn-primary me-3`} onClick={chooseFile}>
                Select archive
            </button>
        </>

    );
};


export const DirectoryScannerF: FC<FilePickerProps> = ({ onFileSelected}) => {
    const {recordLog} = useLogs();
    const inputRef = React.useRef<HTMLInputElement>(null);
    function chooseFile() {
        inputRef.current?.click();
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            console.log(e.target.files)
            onFileSelected({
                    Fs: new FileApi(recordLog),
                    FileName: e.target.files[0].name,
                    Id: uuidv4()
                }
            )

        } else {
            alert('Please select a file.');
        }
    };


    // const scan = async (e: MouseEvent<HTMLButtonElement>) => {
    //     e.preventDefault();
    //     try {
    //         if (window.showDirectoryPicker) {
    //             try {
    //                 onFileSelected(await scanDir(await window.showDirectoryPicker(), (s: string, logLevel: number)=>{}));
    //             } catch (err) {
    //                 if (err instanceof DOMException && err.name === 'AbortError') {
    //                     console.log('Directory picker was cancelled');
    //                 } else {
    //                     // Handle any other errors
    //                     console.error(err);
    //                 }
    //             }
    //         } else {
    //             console.log('Directory picker is not supported in this browser');
    //         }
    //
    //
    //
    //
    //     } catch (err) {
    //         if (err instanceof DOMException && err.name === 'AbortError') {
    //
    //         } else {
    //             // Handle any other errors
    //             console.error(err);
    //         }
    //     }
    // };



    return (
        <>
            <input type="file" style={{display:'none'}} onChange={handleFileChange}
                   ref={inputRef}   {...({webkitdirectory: "true", directory: "true"} as any)}/>
            <button className={`btn btn-primary me-3`} onClick={chooseFile}>
                Scan DIRR
            </button>
        </>

)
    ;
};