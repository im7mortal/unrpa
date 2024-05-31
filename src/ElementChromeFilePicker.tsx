import { FC, MouseEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileSystemAccessApi, FileSystemAccessApiInterface, MetadataResponse } from './detectVersion';

interface FilePickerProps {
    onFileSelected: (fileExtraction: FileExtraction[]) => void;
}



export interface FileExtraction {
    Fs: FileSystemAccessApiInterface;
    FileName: string;
    Id: string;
}

export const FilePicker: FC<FilePickerProps> = ({ onFileSelected}) => {

    const chooseFile = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            let [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            let fs: FileSystemAccessApiInterface = new FileSystemAccessApi((s: string, logLevel: number) => void{})
            let resp: MetadataResponse = await fs.extractMetadata(file);
            if (resp.Error === "") {
                onFileSelected([{
                    Fs: fs,
                    FileName: file.name,
                    Id: uuidv4()
                }
                ])

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
        <button id="filePick" className="btn btn-primary me-3" onClick={chooseFile}>
            Select archiveLOL
        </button>
    );
};