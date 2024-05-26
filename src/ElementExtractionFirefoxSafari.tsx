import React, {useState, useEffect, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
    FClassInterface,
    FileApi,
} from './detectVersion';
import {useLogs} from "./LogProvider";

function FirefoxSafari() {
    // Implement your functions
    const [isFilePicked, setFilePicked] = useState(false);
    const [isExtracted, setExtracted] = useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);

    const {recordLog} = useLogs();

    const fClass = useRef<FClassInterface | null>(null);
    useEffect(() => {

        fClass.current = new FileApi(recordLog)
    }, [recordLog]);


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
        setFilePicked(true)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            fClass.current?.extractMetadata(e.target.files[0]);
        } else {
            alert('Please select a file.');
        }
    };

    const start = async () => {
        await fClass.current?.extract()
        setExtracted(true)
    }


    return (
        <>
            <input type="file" className="invisible" onChange={handleFileChange} ref={inputRef}/>
            <button className={`btn ${isFilePicked ? 'btn-success' : 'btn-primary'} me-3`} onClick={chooseFile}>Select
                archive
            </button>
            <button
                className={`btn ${isFilePicked ? (isExtracted ? 'btn-success' : 'btn-primary') : 'btn-secondary'} me-3`}
                onClick={start} disabled={!isFilePicked}>Extract
            </button>
        </>
    )
        ;

}

export default FirefoxSafari;