import React, { useState } from 'react';
import * as bowser from "bowser";
import {FClassInterface, FileApi, FileSystemAccessApi} from './detectVersion';

function MyButtonsComponent() {
    // Implement your functions
    const [isFilePicked, setFilePicked] = useState(false);
    const [isDirectoryPicked, setDirectoryPicked] = useState(false);

    const browser = bowser.getParser(window.navigator.userAgent);

    let fClass: FClassInterface;


    let b = browser.getBrowserName();
    if (b === "Safari" || b === "Firefox") {
        fClass = new FileApi((s: string) => {
        }, () => {
        }, () => {
        })
    } else {
        fClass = new FileSystemAccessApi((s: string) => {
        }, () => {
        }, () => {
        });
    }

    const chooseFile = async () => {
        try {
            let [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            await fClass.extractMetadata(file);
            setFilePicked(true);
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {

            } else {
                // Handle any other errors
                console.error(err);
            }
        }
    };

    const chooseDirectory = async () => {
        if(window.showDirectoryPicker) {
            try {
                let directoryHandle = await window.showDirectoryPicker();
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


    const scanDirectory = () => alert('To directory clicked');

    return (
        <div className="col">
            <button id="filePick" className="button-blue" onClick={chooseFile}>Select archive</button>
            <button id="dirrPick" onClick={chooseDirectory} disabled={!isFilePicked}>To directory</button>
            <button id="start" onClick={chooseFile} disabled={!isFilePicked}>Extract</button>
            <span className={`fs-2 font-weight-bold me-3 ms-3 ${isFilePicked ? 'invisible' : ''}`}>OR</span>
            <button id="selectDirectory" onClick={chooseDirectory}>Scan directory</button>
        </div>
    );

}

export default MyButtonsComponent;