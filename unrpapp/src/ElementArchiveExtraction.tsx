import React, {useState, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
    FClassInterface,
    FileApi,
    FileSystemAccessApi,
    MetadataResponse,
    FileSystemAccessApiInterface,
    FileExtraction
} from './detectVersion';

interface ElementArchiveExtractionProps {
    fClassE: FileExtraction;
    handleRemove: () => void
    logF: (s: string) => void
}

function ElementArchiveExtraction({fClassE, handleRemove, logF}: ElementArchiveExtractionProps) {

    const [isDirectoryPicked, setDirectoryPicked] = useState(false);
    const [isExtracted, setExtracted] = useState(false);

    const fClass = useRef<FileSystemAccessApiInterface>(fClassE.Fs);

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

    const cancelOperation = async () => {
        fClass.current = new FileSystemAccessApi(logF);
        setDirectoryPicked(false)
        setExtracted(false)
        handleRemove()
    }

    return (
        <div className="row">
            <div className="col">
                <span>{fClassE.FileName}</span>
                <button
                    className={`btn ${isDirectoryPicked ? 'btn-success' : 'btn-primary'} me-3`}
                    onClick={chooseDirectory}>To
                    directory
                </button>
                <button
                    className={`btn ${isDirectoryPicked ? (isExtracted ? 'btn-success' : 'btn-primary') : 'btn-secondary'} me-3`}
                    onClick={start} disabled={!isDirectoryPicked}>Extract
                </button>
                <button className="btn btn-danger" onClick={cancelOperation}>
                    <span>&#x2715;</span> Cancel
                </button>
            </div>
        </div>
    );
}

export default ElementArchiveExtraction;