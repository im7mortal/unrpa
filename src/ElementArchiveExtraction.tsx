import React, {useState, useRef, useContext, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import {logLevelFunction} from './logInterface';

import {
    FileSystemAccessApiInterface,
    FileExtraction,
} from './detectVersion';
import ClipLoader from "react-spinners/ClipLoader";
import PulseLoader from "react-spinners/PulseLoader";
import ApiInfoContext from "./ContextAPI";
import {MetadataResponse} from "./unrpaLib/unrpaLibTypes";

interface ElementArchiveExtractionProps {
    fClassE: FileExtraction;
    handleRemove: () => void
    logF: logLevelFunction
}

function ElementArchiveExtraction({fClassE, handleRemove, logF}: ElementArchiveExtractionProps) {

    const [isDirectoryPicked, setDirectoryPicked] = useState(false);
    const [isExtracted, setExtracted] = useState(false);
    const [isExtracting, setExtracting] = useState(false);
    const [isParsed, setParsed] = useState(false);


    const {fileSystemApi} = useContext(ApiInfoContext);

    const fClass = useRef<FileSystemAccessApiInterface>(fClassE.Fs);


    useEffect( ()  => {
        const fetchAndUpdateMetadata = async () => {
            let resp: MetadataResponse = await fClass.current.extractMetadata();
            if (resp.Error !== "") {
                alert("THERE WAS AN ERROR WITH ")
                console.log(resp.Error);
                handleRemove()
            }
            console.log(resp.Error);
            // TODO add promise resolver
            setParsed(true)

            console.log(fClassE.FileName)

        }

        fetchAndUpdateMetadata()
    })


    const chooseDirectory = async () => {
        if (window.showDirectoryPicker) {
            try {
                let directoryHandle = await window.showDirectoryPicker();
                if (fClass.current?.setDirectoryHandle) {
                    fClass.current.setDirectoryHandle(directoryHandle);
                    setDirectoryPicked(true);
                } else {
                    // TODO handle error or fall back to some default behavior
                }
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

    return (
        <div className="row">
            <div className="col-2">
            </div>
            <div className="col-1">
                <span>{fClassE.FileName}</span>
            </div>
            <div className="col-1">
                <ClipLoader color={'#123abc'} loading={isExtracting && !isExtracted} size={20}/>
            </div>
            {!isParsed ? (
                <>
                    <div className="col-2">
                        <span>{fClassE.SizeMsg}</span>
                    </div>
                    <div className="col-3">
                        <PulseLoader color={'#123abc'} loading={true} size={20}/>
                    </div>
                </>

            ) : (
                <div className="col-5">
                    <button
                        className={`btn ${isDirectoryPicked ? 'btn-success' : 'btn-primary'} me-3`}
                        onClick={chooseDirectory} disabled={isExtracting}
                        style={{display: fileSystemApi ? 'inline-block' : 'none'}}>
                        {isDirectoryPicked ? 'Change the' : 'To'} directory
                    </button>
                    <button
                        className={`btn ${isExtracted ? 'btn-success' : 'btn-primary'} me-3`}
                        onClick={start} disabled={(!isDirectoryPicked && fileSystemApi) || isExtracting}>Extract
                    </button>
                    <button className={`btn ${isExtracted ? 'btn-success' : 'btn-danger'}`}
                            onClick={handleRemove} // handle remove do not cancel corresponding worker; it's not critical
                    >
                        <span>&#x2715;</span> {isExtracted ? "Close" : "Cancel"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ElementArchiveExtraction;