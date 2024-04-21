import React, {useState, useEffect, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as bowser from "bowser";
import {
    FClassInterface,
    FileApi,
    FileSystemAccessApi,
    MetadataResponse,
    FileSystemAccessApiInterface,
    scanDir, FileExtraction
} from './detectVersion';

function logMock(s: string) {

}


function MyButtonsComponent() {
    // Implement your functions
    const [isFilePicked, setFilePicked] = useState(false);
    const [isDirectoryPicked, setDirectoryPicked] = useState(false);
    const [isExtracted, setExtracted] = useState(false);
    const [Archives, setArchives] = useState<FileExtraction[]>([]);

    const browser = bowser.getParser(window.navigator.userAgent);

    const fClass = useRef<FileSystemAccessApiInterface | null>(null);
    useEffect(() => {
        const browser = bowser.getParser(window.navigator.userAgent);
        let b = browser.getBrowserName();
        if (b === "Safari" || b === "Firefox") {
            // fClass.current = new FileApi((s: string) => { });
        } else {
            ;
        }
        fClass.current = new FileSystemAccessApi(logMock)
    }, []);


    const chooseFile = async () => {
        try {
            let [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            let resp: MetadataResponse = await fClass.current!.extractMetadata(file);
            if (resp.Error === "") {
                setFilePicked(true);
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

    const getChooseDirectoryF = (fClass: any, setDirectoryPicked: (picked: boolean) => void): () => Promise<void> => {

        return async () => {
            if (window.showDirectoryPicker) {
                try {
                    let directoryHandle = await window.showDirectoryPicker();
                    fClass.current?.setDirectoryHandle(directoryHandle);
                    setDirectoryPicked(true);
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
        };
    };

    const start = async () => {
        await fClass.current?.extract()
        setExtracted(true)
    }

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

    const cancelOperation = async () => {
        fClass.current = new FileSystemAccessApi(logMock);
        setFilePicked(false)
        setDirectoryPicked(false)
        setExtracted(false)
    }






    if (isFilePicked) {
        return (
            <div className="col">
                <button className={`btn ${isFilePicked ? 'btn-success' : 'btn-primary'} me-3`}
                        onClick={chooseFile}>Select archive
                </button>
                <button
                    className={`btn ${isFilePicked ? (isDirectoryPicked ? 'btn-success' : 'btn-primary') : 'btn-secondary'} me-3`}
                    onClick={getChooseDirectoryF(fClass.current, setDirectoryPicked)} disabled={!isFilePicked}>To directory
                </button>
                <button
                    className={`btn ${isDirectoryPicked ? (isExtracted ? 'btn-success' : 'btn-primary') : 'btn-secondary'} me-3`}
                    onClick={start} disabled={!isDirectoryPicked}>Extract
                </button>
                <button className="btn btn-danger" onClick={cancelOperation}>
                    <span>&#x2715;</span> Cancel
                </button>
            </div>
        );
    } else if (Archives.length !== 0) {

        return <div>
            {Archives.map((item: FileExtraction, index: number) => (
                <div className="row" key={index}>
                    <div className="col">
                        <span>{item.FileName}</span>
                        <button
                            className={`btn ${item.DirectoryPicked ? 'btn-success' : 'btn-primary'} me-3`}
                            onClick={getChooseDirectoryF(item.Fs, setDirectoryPicked)}>To directory
                        </button>
                        <button
                            className={`btn ${item.Extracted ? 'btn-success' : 'btn-primary'} me-3`}
                            onClick={start} disabled={!isDirectoryPicked}>Extract
                        </button>
                        <button className="btn btn-danger" onClick={cancelOperation}>
                            <span>&#x2715;</span> Cancel
                        </button>
                    </div>
                </div>
            ))}
        </div>


    } else {
        return (
            <div>
                <div className="col">
                    <button id="filePick" className={`btn ${isFilePicked ? 'btn-success' : 'btn-primary'} me-3`}
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
        )
            ;

    }

}

export default MyButtonsComponent;