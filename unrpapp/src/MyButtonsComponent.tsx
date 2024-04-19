import React, {useState, useEffect, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as bowser from "bowser";
import {
    FClassInterface,
    FileApi,
    FileSystemAccessApi,
    MetadataResponse,
    FileSystemAccessApiInterface
} from './detectVersion';

function MyButtonsComponent() {
    // Implement your functions
    const [isFilePicked, setFilePicked] = useState(false);
    const [isDirectoryPicked, setDirectoryPicked] = useState(false);
    const [isExtracted, setExtracted] = useState(false);

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
        fClass.current = new FileSystemAccessApi((s: string) => {
        })
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

    const chooseDirectory = async () => {
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

    const start = async () => {
        await fClass.current?.extract()
        setExtracted(true)
    }


    const scanDirectory = () => alert('To directory clicked');
    if (isFilePicked) {
        return (
            <div className="col">
                <button id="filePick" className={`btn ${isFilePicked ? 'btn-success' : 'btn-primary'} me-3`} onClick={chooseFile}>Select archive</button>
                <button id="dirrPick" className={`btn ${isFilePicked ? (isDirectoryPicked ? 'btn-success' : 'btn-primary') : 'btn-secondary'} me-3`} onClick={chooseDirectory} disabled={!isFilePicked}>To directory</button>
                <button id="startExt" className={`btn ${isDirectoryPicked ? (isExtracted ? 'btn-success' : 'btn-primary') : 'btn-secondary'} `} onClick={start} disabled={!isDirectoryPicked}>Extract</button>
            </div>
        );
    } else {
        return (
            <div>
                <div className="col">
                    <button id="filePick" className={`btn ${isFilePicked ? 'btn-success' : 'btn-primary'} me-3`}
                            onClick={chooseFile}>Select archive
                    </button>
                    <span className={`fs-2 font-weight-bold me-3 ms-3`}>OR</span>
                    <button id="selectDirectory" className="btn btn-primary" onClick={chooseDirectory}>Scan directory
                    </button>
                </div>
                <div className="col">
                    <span className="fs-2 font-weight-bold me-3 ms-3">DRAG AND DROP FILES</span>
                </div>
            </div>
        )
            ;

    }

}

export default MyButtonsComponent;