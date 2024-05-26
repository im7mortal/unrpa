import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {v4 as uuidv4} from 'uuid';

import { useLogs } from './LogProvider';

import {
    FileSystemAccessApi,
    MetadataResponse,
    FileSystemAccessApiInterface,
    scanDir, FileExtraction
} from './detectVersion';
import ElementArchiveExtraction from "./ElementArchiveExtraction";

function logMock(s: string) {

}


function MyButtonsComponent() {
    // Implement your functions
    const [Archives, setArchives] = useState<FileExtraction[]>([]);
    const { recordLog } = useLogs();
    const chooseFile = async () => {

        try {
            let [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            let fs: FileSystemAccessApiInterface = new FileSystemAccessApi(recordLog)
            let resp: MetadataResponse = await fs.extractMetadata(file);
            if (resp.Error === "") {
                setArchives([{
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

    const scan = async () => {
        if (window.showDirectoryPicker) {
            try {
                setArchives(await scanDir(await window.showDirectoryPicker(), logMock));
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
    }


    if (Archives.length !== 0) {
        return (
            <div>
                {Archives.map((item: FileExtraction, index: number) => (
                    <ElementArchiveExtraction fClassE={item} logF={logMock} handleRemove={() => {
                        setArchives(Archives.filter((_, i) => i !== index))  // This will remove current item from Archives
                    }} key={item.Id}/>
                ))}
            </div>);
    } else {
        return (
            <div>
                <div className="col">
                    <button id="filePick" className={`btn btn-primary me-3`}
                            onClick={chooseFile}>Select archive
                    </button>
                    <span className={`fs-2 font-weight-bold me-3 ms-3`}>OR</span>
                    <button id="selectDirectory" className="btn btn-primary" onClick={scan}>Scan
                        directory
                    </button>
                </div>
                <div className="col">
                    <span className="fs-2 font-weight-bold me-3 ms-3 invisible">DRAG AND DROP FILES</span>
                </div>
            </div>
        );
    }
}

export default MyButtonsComponent;