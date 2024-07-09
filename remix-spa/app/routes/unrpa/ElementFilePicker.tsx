import React, {FC, MouseEvent, useContext} from 'react';
import {v4 as uuidv4} from 'uuid';
import {
    FileSystemAccessApi,
    FileSystemAccessApiInterface,
    FileApi
} from './detectVersion';
import ContextSpinner from "./ContextSpinner";
import ApiInfoContext from "./ContextAPI";
import {useLogs} from "./ContextLog";

interface FilePickerProps {
    onFileSelected: (fileExtraction: FileExtraction) => void;
}


export interface FileExtraction {
    Fs: FileSystemAccessApiInterface;
    FileName: string;
    Id: string;
    Parsed: boolean;
    SizeMsg: string;
}

export const FilePicker: FC<FilePickerProps> = ({onFileSelected}) => {

    const spinnerContext = useContext(ContextSpinner);
    if (!spinnerContext) {
        throw new Error('SpinnerContext must be used within a SpinnerProvider');
    }
    // eslint-disable-next-line
    const {spinner, setSpinnerState} = spinnerContext;

    const {fileSystemApi} = useContext(ApiInfoContext);

    const chooseFileSystemAPI = async (e: MouseEvent<HTMLButtonElement>) => {
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

            processFile(file)

        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {

            } else {
                // Handle any other errors
                console.error(err);
            }
        }
    };


    const {recordLog} = useLogs();
    const inputRef = React.useRef<HTMLInputElement>(null);

    function chooseFileApi() {
        inputRef.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            processFile(e.target.files[0])
        } else {
            alert('Please select a file.');
        }
    };


    function processFile(file: File): void {


        let f: FileSystemAccessApiInterface;
        if (fileSystemApi) {
            f = new FileSystemAccessApi(file, (s: string, logLevel: number) => void {})
        } else {
            f = new FileApi(file, recordLog)
        }

        onFileSelected({
                Fs: f,
                FileName: file.name,
                Id: uuidv4(),
                SizeMsg: "",
                Parsed: true
            }
        )
    }


    return (

        <>
            {fileSystemApi ? (
                <button className="btn btn-primary me-3" onClick={chooseFileSystemAPI}>
                    Select archive
                </button>
            ) : (
                <>
                    <input type="file" style={{display: 'none'}} onChange={handleFileChange} ref={inputRef}
                           accept=".rpa"/>
                    <button className={`btn btn-primary me-3`} onClick={chooseFileApi}>
                        Select archive
                    </button>
                </>
            )}
        </>


    );
};

