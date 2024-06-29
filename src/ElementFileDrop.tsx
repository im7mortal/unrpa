import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./overlay-spinner.css"
import React, { useCallback, useEffect, useContext} from 'react';
import {useDropzone} from 'react-dropzone';
import {FilesContext} from "./ContextDropdownFiles";
import { fileExtractionCreator,} from "./detectVersion";
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
    }, []);
    useDropzone({
        onDrop,
        noClick: true,
        preventDropOnDocument: true,
    });

    useEffect(() => {
        function handleDrop(event: DragEvent) {
            event.preventDefault();
            if (event.dataTransfer) {
                var droppedFiles = event.dataTransfer.files;
                if (droppedFiles.length) {
                    // Call our onDrop handler with the dropped files.
                    onDrop(Array.from(droppedFiles));
                }
            }
        }

        function handleDragOver(event: DragEvent) {
            event.preventDefault();
        }

        document.body.addEventListener('drop', handleDrop);
        document.body.addEventListener('dragover', handleDragOver);

        return (): void => {
            document.body.removeEventListener('drop', handleDrop);
            document.body.removeEventListener('dragover', handleDragOver);
        };
    }, [onDrop]);


    return (<></>);
}

export default Drop;
