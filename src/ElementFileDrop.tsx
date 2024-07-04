import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./overlay-spinner.css"
import React, {useCallback, useEffect, useContext} from 'react';
import {useDropzone} from 'react-dropzone';
import {FilesContext} from "./ContextDropdownFiles";
import {fileExtractionCreator,} from "./detectVersion";
import ApiInfoContext from "./ContextAPI";

function Drop() {
    const {fileSystemApi} = useContext(ApiInfoContext);
    const {dispatch} = useContext(FilesContext);

    const onDrop = useCallback((acceptedFiles: File[]) => {


        let creator = fileExtractionCreator(fileSystemApi, (s: string, logLevel: number) => {
        })
        acceptedFiles.forEach(file => {


            if (file.name.endsWith('.rpa')) { // TODO duplicate
                dispatch({type: 'ADD', payload: creator(file)})
            } else {
                alert(file.name + " not supported")
            }
        });
        // eslint-disable-next-line
    }, [fileSystemApi, dispatch]);

    const handleDrop = (event: React.DragEvent<HTMLDivElement> | DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer) {
            const items = event.dataTransfer.items;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
                    if (entry && entry.isDirectory) {
                        handleDirectoryDrop(entry);
                    } else {
                        const file = item.getAsFile();
                        if (file) {
                            onDrop([file]);
                        }
                    }
                }
            }
        }
    };

    const handleDirectoryDrop = async (directoryEntry: any) => {
        // For browsers supporting directory uploads (e.g., Firefox)
        const dirReader = directoryEntry.createReader();
        const readEntries = () => new Promise<DataTransferItem[]>((resolve, reject) => {
            dirReader.readEntries(resolve, reject);
        });

        try {
            const entries = await readEntries();
            entries.forEach(async (fileEntry: any) => {
                if (fileEntry.isDirectory) {
                    await handleDirectoryDrop(fileEntry);
                } else {
                    const file = await new Promise<File>((resolve, reject) => {
                        fileEntry.file(resolve, reject);
                    });
                    if (file.name.endsWith('.rpa')) {
                        const creator = fileExtractionCreator(fileSystemApi, (s: string, logLevel: number) => {
                        });
                        dispatch({type: 'ADD', payload: creator(file)});
                    } else {
                        console.log(file.name + " not supported");
                    }
                }
            });
        } catch (error) {
            console.error("Error reading directory:", error);
        }
    };

    useEffect(() => {
        const handleDragOver = (event: DragEvent) => {
            event.preventDefault();
        };

        document.body.addEventListener('drop', handleDrop);
        document.body.addEventListener('dragover', handleDragOver);

        return () => {
            document.body.removeEventListener('drop', handleDrop);
            document.body.removeEventListener('dragover', handleDragOver);
        };
    });

    useDropzone({
        onDrop,
        noClick: true,
        preventDropOnDocument: true,
    });

    return (<></>);
}

export default Drop;
