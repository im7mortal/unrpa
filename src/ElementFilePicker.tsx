import React, {FC, MouseEvent, useContext} from 'react';
import {v4 as uuidv4} from 'uuid';
import {
    FileSystemAccessApi,
    FileSystemAccessApiInterface,
    FileApi
} from './detectVersion';
import ContextSpinner from "./ContextSpinner";
import ApiInfoContext from "./ContextAPI";
import {useLogs} from "./ContextLog";

import {WorkerUrl} from "worker-url";

interface FilePickerProps {
    onFileSelected: (fileExtraction: FileExtraction) => void;
}


export interface FileExtraction {
    Fs: FileSystemAccessApiInterface;
    FileName: string;
    Id: string;
    Parsed: boolean;
    SizeMsg: string;
}

export const FilePicker: FC<FilePickerProps> = ({onFileSelected}) => {

    const spinnerContext = useContext(ContextSpinner);
    if (!spinnerContext) {
        throw new Error('SpinnerContext must be used within a SpinnerProvider');
    }
    // eslint-disable-next-line
    const {spinner, setSpinnerState} = spinnerContext;

    const {fileSystemApi} = useContext(ApiInfoContext);

    const chooseFileSystemAPI = async (e: MouseEvent<HTMLButtonElement>) => {

        clickk1()
        if (true) {
            return
        }


        e.preventDefault();
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'RPA files',
                    accept: {
                        'text/rpa': ['.rpa']
                    }
                }]
            });
            const file = await fileHandle.getFile();

            processFile(file)

        } catch (err) {
            if (err instanceof DOMException ) {

            } else {
                // Handle any other errors
                console.error(err);
            }
        }
    };
    function sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function clickk1() {
        // worker.start()

        async function app() {
            console.log('LETS FETCH');


            const url = 'http://localhost:3000/unrpa/static/js/fff';
            const request = new Request(url, {
                method: 'GET', // or 'POST', etc.
                headers: new Headers({
                    'Content-Type': 'application/json',
                    // Add other headers as needed
                }),
                // Add other options as needed
            });

            const response = await fetch(request)
            // const user = await response.json()
            const d = await response
            response.headers.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });
            console.log(response.status)
            console.log(response.text())



            // const url = URL.createObjectURL();
            // const a = document.createElement("a");
            // document.body.appendChild(a);
            // a.style.display = "none";
            // a.href = '/unrpa/static/js/downloadZip/';
            // a.download = 'lol.txt';
            // a.click();

        }
        console.log('Start');
        await sleep(1000); // Sleep for 1 second
        console.log('1 second later');
        app()
    }

    const {recordLog} = useLogs();
    const inputRef = React.useRef<HTMLInputElement>(null);

    function chooseFileApi() {

        clickk1()
        return

        inputRef.current?.click();
    }

    function MIU() {

        fetch("/test").then(response => {
            console.log("Response:", response.text());
        }).catch(err => {
            console.error("Error while fetching:", err);
        });

    }

    function REG() {

        if ('serviceWorker' in navigator) {
            console.log(import.meta.url)
            // webpack understand from this part that we need compile separate worker file from this .ts
            const WorkerURL = new WorkerUrl(new URL('./workers/networkWorker.worker.ts', import.meta.url))
            console.log(WorkerURL.toString())
            navigator.serviceWorker.register(WorkerURL.toString(), {scope: "/unrpa/static/js/"}).then((registration) => {
                console.log('Service Worker registered successfully with scope:', registration.scope);


                async function pingServiceWorker() {
                    for (let i = 0; i < 3; i++) {
                        console.log('Start');
                        if (registration.active) {
                            registration.active.postMessage('ping');
                            // if ('backgroundFetch' in registration) {
                            //     let c: any = registration.backgroundFetch
                            //     if ('fetch' in c) {
                            //         console.log(c)
                            //         console.log(c.fetch)
                            //         c.fetch("lol","/unrpa/static/js/")
                            //     }
                            // }
                            console.log('Ping sent');
                        } else {
                            console.warn('Service Worker is not active yet.');
                        }
                        await sleep(1000); // Sleep for 1 second
                        console.log('1 second later');
                    }
                }

                // Start pinging the service worker
                pingServiceWorker();
            }).catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        }


    }
    function REG2() {

        async function registerServiceWorker() {
            try {
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.register('/unrpa/worker.js');
                    console.log('Service Worker registered with scope:', registration.scope);
                    const readyRegistration = await navigator.serviceWorker.ready;
                    if (readyRegistration.active === null) {
                        return
                    }
                    console.log('Service Worker is active:', readyRegistration.active.state);
                } else {
                    console.error('Service Workers are not supported in this browser.');
                }
            } catch (error) {
                console.error('Service Worker registration or activation failed:', error);
            }
        }

        registerServiceWorker();

    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            processFile(e.target.files[0])
        } else {
            alert('Please select a file.');
        }
    };


    function processFile(file: File): void {


        let f: FileSystemAccessApiInterface;
        if (fileSystemApi) {
            f = new FileSystemAccessApi(file, (s: string, logLevel: number) => void {})
        } else {
            f = new FileApi(file, recordLog)
        }

        onFileSelected({
                Fs: f,
                FileName: file.name,
                Id: uuidv4(),
                SizeMsg: "",
                Parsed: true
            }
        )
    }


    return (

        <>
            {fileSystemApi ? (
                <button className="btn btn-primary me-3" onClick={chooseFileSystemAPI}>
                    Select archive
                </button>
            ) : (
                <>
                    <input type="file" style={{display: 'none'}} onChange={handleFileChange} ref={inputRef}
                           accept=".rpa"/>
                    <button className={`btn btn-primary me-3`} onClick={chooseFileApi}>
                        Select archive
                    </button>
                </>
            )}
            <a href="/unrpa/hey">DOWNDLOD</a>
            <button className={`btn btn-primary me-3`} onClick={MIU}>
                MIU
            </button>
            <button className={`btn btn-primary me-3`} onClick={REG2}>
                REG
            </button>
        </>


    );
};

