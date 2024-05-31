import React, {FC, MouseEvent, useRef} from 'react';
import {v4 as uuidv4} from 'uuid';
import {
    FClassInterface,
    FileApi,
    FileSystemAccessApi,
    FileSystemAccessApiInterface,
    MetadataResponse
} from './detectVersion';
import {useLogs} from "./LogProvider";

interface FilePickerProps {
    onFileSelected: (fileExtraction: FileExtraction[]) => void;
}


export interface FileExtraction {
    Fs: FileSystemAccessApiInterface;
    FileName: string;
    Id: string;
}

export const FilePickerC: FC<FilePickerProps> = ({onFileSelected}) => {
    const {recordLog} = useLogs();
    const inputRef = React.useRef<HTMLInputElement>(null);
    function chooseFile() {
        inputRef.current?.click();
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {

            onFileSelected([{
                Fs: new FileApi(recordLog),
                FileName: e.target.files[0].name,
                Id: uuidv4()
            }
            ])

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