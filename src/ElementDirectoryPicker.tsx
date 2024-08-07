import React, {FC, MouseEvent, useContext} from 'react';
import {
    scanDir,
    fileExtractionCreator,
    FileExtraction
} from './detectVersion';
import ContextSpinner from "./ContextSpinner";
import ApiInfoContext from "./ContextAPI";
import {useTranslation} from "react-i18next";

interface FilePickerProps {
    onFileSelected: (fileExtraction: FileExtraction) => void;
}

export const DirectoryScanner: FC<FilePickerProps> = ({onFileSelected}) => {
    const {t} = useTranslation();
    const inputRef = React.useRef<HTMLInputElement>(null);

    const {fileSystemApi} = useContext(ApiInfoContext);


    const spinnerContext = useContext(ContextSpinner);
    if (!spinnerContext) {
        throw new Error('SpinnerContext must be used within a SpinnerProvider');
    }
    // eslint-disable-next-line
    const {spinner, setSpinnerState} = spinnerContext;

    function getIter(dirHandle: FileSystemDirectoryHandle): () => AsyncGenerator<File, void, undefined> {
        return async function* (): AsyncGenerator<File, void, undefined> {
            for await (const entry of dirHandle.values()) {
                if (entry.kind === 'file') {
                    if (entry.name.endsWith('.rpa')) {
                        const file = await (entry as FileSystemFileHandle).getFile();
                        yield file;
                    }
                } else if (entry.kind === 'directory') {
                    const dirEntry = entry as FileSystemDirectoryHandle;
                    yield* getIter(dirEntry)();
                }
            }
        }
    }


    const scan = async (e: MouseEvent<HTMLButtonElement>) => {
        setSpinnerState(true)
        e.preventDefault();
        try {
            if (window.showDirectoryPicker) {
                try {
                    scan1(getIter(await window.showDirectoryPicker()))
                } catch (err) {
                    if (err instanceof DOMException && err.name === 'AbortError') {
                        console.log('Directory picker was cancelled');
                    } else {
                        // Handle any other errors
                        console.error(err);
                    }
                }
                setSpinnerState(false)

            } else {
                console.log('Directory picker is not supported in this browser');
            }


        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {

            } else {
                // Handle any other errors
                console.error(err);
            }
        }
    };


    function chooseFile() {
        setSpinnerState(true)
        inputRef.current?.click();
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            scan1(getIter1(e.target.files))
        } else {
            alert('Please select a directory.');
        }
    };

    async function scan1(iterateDirectory: () => AsyncGenerator<File, void, undefined>) {
        try {
            const iterator = scanDir(iterateDirectory, (s: string, logLevel: number) => {
            }, fileExtractionCreator(fileSystemApi, (s: string, logLevel: number) => {
            }), onFileSelected);
            for await (const file of iterator) {
                onFileSelected(file);
            }
            setSpinnerState(false)

        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                console.log('Directory picker was cancelled');
            } else {

                console.error(err);
            }
        }
        setSpinnerState(false)

    }


    const getIter1 = function (files: FileList): () => AsyncGenerator<File, void, undefined> {
        return async function* (): AsyncGenerator<File, void, undefined> {
            for await (const file of files) {
                if (file.name.endsWith('.rpa')) {
                    yield file;
                }
            }
        }
    }


    return (
        <>
            {fileSystemApi ? (
                <button className="btn btn-primary" onClick={scan}>
                    {t('scanDirectory')}
                </button>
            ) : (
                <>
                    <input type="file" style={{display: 'none'}} onChange={handleFileChange}
                           ref={inputRef}   {...({webkitdirectory: "true", directory: "true"} as any)}/>
                    <button className={`btn btn-primary me-3`} onClick={chooseFile}>
                        {t('scanDirectory')}
                    </button>
                </>
            )}
        </>


    )


};