import React, {useState, useEffect, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
    FClassInterface,
    FileApi
} from './detectVersion';
import {useLogs} from "./LogProvider";

function FirefoxSafari() {
    // Implement your functions
    const [isFilePicked, setFilePicked] = useState(false);
    const [isExtracted, setExtracted] = useState(false);
    const [isExtracting, setExtracting] = useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);

    const {recordLog} = useLogs();

    const fClass = useRef<FClassInterface | null>(null);
    useEffect(() => {

        fClass.current = new FileApi(recordLog)

        // TODO We ignore following warning as if we fix it, it will cause rerendering of the element and lose of FileApi instance
        // React Hook useEffect has a missing dependency: 'recordLog'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

        // eslint-disable-next-line
    }, []);


    // const chooseFile = async () => {
    //     try {
    //         let [fileHandle] = await window.showOpenFilePicker();
    //         const file = await fileHandle.getFile();
    //         let resp: MetadataResponse = await fClass.current!.extractMetadata(file);
    //         if (resp.Error === "") {
    //             setFilePicked(true);
    //         } else {
    //             console.log(resp.Error);
    //         }
    //
    //     } catch (err) {
    //         if (err instanceof DOMException && err.name === 'AbortError') {
    //
    //         } else {
    //             // Handle any other errors
    //             console.error(err);
    //         }
    //     }
    // };

    function chooseFile() {
        inputRef.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            fClass.current?.extractMetadata(e.target.files[0]);
            setFilePicked(true)
        } else {
            alert('Please select a file.');
        }
    };

    const start = async () => {
        setExtracting(true)
        await fClass.current?.extract()
        setExtracted(true)
    }

    const cancelOperation = async () => {
        fClass.current?.cancel()
        fClass.current = new FileApi(recordLog);
        setExtracted(false)
        setFilePicked(false)
        setExtracting(false)
    }

    return (
        <>
            {/*<input type="file" className="invisible" onChange={handleFileChange}*/}
            {/*       ref={inputRef}   {...({webkitdirectory: "true", directory: "true"} as any)}/>*/}

            <input type="file" className="invisible" onChange={handleFileChange} ref={inputRef}/>
            <button className={`btn ${isFilePicked ? 'btn-success' : 'btn-primary'} me-3`} onClick={chooseFile}
                    disabled={isExtracting}>
                Select archive
            </button>
            <button
                className={`btn ${isFilePicked ? (isExtracted ? 'btn-success' : 'btn-primary') : 'btn-secondary'} me-3`}
                onClick={start} disabled={!isFilePicked || isExtracting}>Extract
            </button>
            {isFilePicked ?
                <button className={`btn ${isExtracted ? 'btn-success' : 'btn-danger'}`} onClick={cancelOperation}>
                    <span>&#x2715;</span> {isExtracted ? "Close" : "Cancel"}
                </button> : <></>
            }
        </>
    )
        ;

}

export default FirefoxSafari;