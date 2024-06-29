import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./overlay-spinner.css"
import {DefaultExternalLoggerFunc, LogProvider} from "./LogProvider";
import {LogLevel} from "./logInterface";
import Logs from "./Logs";
import UnrpaApp from "./UnrpaApp";
import {SpinnerProvider} from "./spinnerContext";
import React, {useMemo, useState, useCallback, useEffect} from 'react';
import {useDropzone} from 'react-dropzone';
import {DropdownFilesProvider} from "./DropdownFilesContext";
import {ApiInfoProvider, defaultApiInfo} from "./ContextAPI";

function UnrpaApp1() {
    const [files, setFiles] = useState<File[]>([]);


    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prevFiles => {
            const newFiles = acceptedFiles.filter(acceptedFile => !prevFiles.some(file =>
                file.name === acceptedFile.name &&
                file.size === acceptedFile.size &&
                file.type === acceptedFile.type &&
                file.lastModified === acceptedFile.lastModified
            ));
            return [...prevFiles, ...newFiles];
        });
    }, []);
    const {getRootProps, getInputProps} = useDropzone({
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


    return (
        <div className={`container text-center `}>

            <LogProvider loggers={[
                {logFunction: DefaultExternalLoggerFunc, logLevel: LogLevel.Error},
                {logFunction: console.log, logLevel: LogLevel.Debug}
            ]}>
                <DropdownFilesProvider value={files}>
                    <ApiInfoProvider value={defaultApiInfo}>
                        <SpinnerProvider>
                            <UnrpaApp/>
                            <Logs/>
                        </SpinnerProvider>
                    </ApiInfoProvider>
                </DropdownFilesProvider>
            </LogProvider>


        </div>);
}

export default UnrpaApp1;
