import React, {useState, useRef, useContext, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {v4 as uuidv4} from 'uuid';
import {logLevelFunction} from './logInterface';

import {
    FileSystemAccessApiInterface,
    FileExtraction,
} from './detectVersion';
import ClipLoader from "react-spinners/ClipLoader";
import PulseLoader from "react-spinners/PulseLoader";
import ApiInfoContext from "./ContextAPI";
import {FileHeader, MetadataResponse} from "./unrpaLib/unrpaLibTypes";
import {useServiceWorker} from "./ContextServiceWorker";
import {useTranslation} from 'react-i18next';

interface ElementArchiveExtractionProps {
    fClassE: FileExtraction;
    handleRemove: () => void
    logF: logLevelFunction
}

function ElementArchiveExtraction({fClassE, handleRemove, logF}: ElementArchiveExtractionProps) {

    const {t} = useTranslation();
    const [isDirectoryPicked, setDirectoryPicked] = useState(false);
    const [isExtracted, setExtracted] = useState(false);
    const [isExtracting, setExtracting] = useState(false);
    const [isParsed, setParsed] = useState(false);
    const [processedN, setProcessedN] = useState(0);

    const {sendMessage} = useServiceWorker();

    const {fileSystemApi} = useContext(ApiInfoContext);
    const {fileApiWithServiceWorker} = useContext(ApiInfoContext);

    const fClass = useRef<FileSystemAccessApiInterface>(fClassE.Fs);


    useEffect(() => {
        const fetchAndUpdateMetadata = async () => {
            let resp: MetadataResponse = await fClass.current.extractMetadata();
            if (resp.Error !== "") {
                alert("THERE WAS AN ERROR WITH ")
                console.log(resp.Error);
                handleRemove()
            }
            // TODO add promise resolver
            setParsed(true)

        }

        fetchAndUpdateMetadata()
        if (fClass.current.listenProcessed !== undefined) {
            fClass.current.listenProcessed(setProcessedN)
        }

        // eslint-disable-next-line
    }, [])


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

        if (fileApiWithServiceWorker) {
            await processWithServiceWorker()
        } else {
            await fClass.current?.extract()
        }

        setExtracted(true)
    }

    const processWithServiceWorker = async () => {
        const idd: string = uuidv4();

        // Function to sleep for a given number of milliseconds
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // Function to wait for the service worker to indicate the file is downloaded
        const waitForFileDownload = (id: string) => {
            return new Promise<void>((resolve) => {
                const onMessage = (event: MessageEvent) => {
                    if (event.data && event.data.id === id && event.data.status === 'downloaded') {
                        navigator.serviceWorker.removeEventListener('message', onMessage);
                        resolve();
                    }
                };
                navigator.serviceWorker.addEventListener('message', onMessage);
            });
        };

        // Register the file processing
        fClass.current?.register((file: File, group: FileHeader[]): void => {
            const data = {
                file: file,
                group: group,
                id: idd
            };
            sendMessage(data);
        });

        // Wait for a short time to ensure the message is sent
        await sleep(100);

        // Create the download link
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = "/unrpa/zip/" + idd;
        a.download = idd + ".zip";

        // Add a listener to log when the download starts
        a.addEventListener('click', () => {
            console.log('Download link clicked:', a.href);
        });

        // Trigger the download
        a.click();

        // Clean up the download link
        document.body.removeChild(a);

        // Wait for the download to complete
        await waitForFileDownload(idd);
    };
    return (
        <div className="row">
            <div className="col-2">
            </div>
            <div className="col-1">
                <span>{fClassE.FileName}</span>
            </div>
            <div className="col-1">
                <ClipLoader color={'#123abc'} loading={isExtracting && !isExtracted} size={20}/>
                <span>{processedN}%</span>
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
                        onClick={chooseDirectory}
                        disabled={isExtracting}
                        style={{display: fileSystemApi ? 'inline-block' : 'none'}}
                    >
                        {isDirectoryPicked ? t('changeDirectory') : t('chooseDirectory')}
                    </button>
                    <button
                        className={`btn ${isExtracted ? 'btn-success' : 'btn-primary'} me-3`}
                        onClick={start} disabled={(!isDirectoryPicked && fileSystemApi) || isExtracting}>
                        {t('extract')}
                    </button>
                    <button className={`btn ${isExtracted ? 'btn-success' : 'btn-danger'}`}
                            onClick={handleRemove} // handle remove do not cancel corresponding worker; it's not critical
                    >
                        <span>&#x2715;</span> {isExtracted ? t('close') : t('cancel')}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ElementArchiveExtraction;
