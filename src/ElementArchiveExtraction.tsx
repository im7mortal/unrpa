import React, {useState, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import {logLevelFunction} from './logInterface';

import {
    FileSystemAccessApi,
    FileSystemAccessApiInterface,
    FileExtraction
} from './detectVersion';

interface ElementArchiveExtractionProps {
    fClassE: FileExtraction;
    handleRemove: () => void
    logF: logLevelFunction
}

function ElementArchiveExtraction({fClassE, handleRemove, logF}: ElementArchiveExtractionProps) {

    const [isDirectoryPicked, setDirectoryPicked] = useState(false);
    const [isExtracted, setExtracted] = useState(false);
    const [isExtracting, setExtracting] = useState(false);

    const fClass = useRef<FileSystemAccessApiInterface>(fClassE.Fs);

    const chooseDirectory = async () => {
        if (window.showDirectoryPicker) {
            try {
                let directoryHandle = await window.showDirectoryPicker();
                if (fClass.current?.setDirectoryHandle) {
                    fClass.current.setDirectoryHandle(directoryHandle);
                    setDirectoryPicked(true);
                } else {
                    // TODO handle error or fall back to some default behavior
                };
                setDirectoryPicked(true);
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    console.log('Directory picker was cancelled');
                } else {
                    console.error(err);
                }
            }
        } else {
            console.log('Directory picker is not supported in this browser');
        }
    };
    const start = async () => {
        setExtracting(true)
        await fClass.current?.extract()
        setExtracted(true)
    }

    const cancelOperation = async () => {
        fClass.current.cancel()
        fClass.current = new FileSystemAccessApi(logF);
        setDirectoryPicked(false)
        setExtracted(false)
        handleRemove()
    }

    return (
        <div className="row">
            <div className="col-3">
            </div>
            <div className="col-1">
                <span>{fClassE.FileName}</span>
            </div>
            <div className="col-5">
                <button
                    className={`btn ${isDirectoryPicked ? 'btn-success' : 'btn-primary'} me-3`}
                    onClick={chooseDirectory} disabled={isExtracting} style={{display: fClassE.Firefox ? 'none' : 'inline-block'}}>
                    {isDirectoryPicked ? 'Change the' : 'To'} directory
                </button>
                <button
                    className={`btn ${isExtracted ? 'btn-success' : 'btn-primary'} me-3`}
                    onClick={start} disabled={(!isDirectoryPicked && !fClassE.Firefox) || isExtracting}>Extract
                </button>
                <button className={`btn ${isExtracted ? 'btn-success' : 'btn-danger'}`} onClick={cancelOperation}>
                    <span>&#x2715;</span> {isExtracted ? "Close" : "Cancel"}
                </button>
            </div>
        </div>
    );
}

export default ElementArchiveExtraction;