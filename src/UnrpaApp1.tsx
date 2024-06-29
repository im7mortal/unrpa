import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./overlay-spinner.css"
import { DefaultExternalLoggerFunc, LogProvider } from "./LogProvider";
import { LogLevel } from "./logInterface";
import Logs from "./Logs";
import UnrpaApp from "./UnrpaApp";
import { SpinnerProvider } from "./spinnerContext";
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ApiInfoProvider, defaultApiInfo } from "./ContextAPI";
import { useDispatch } from 'react-redux';
import { addFiles } from './redux/reducers';
import { AppDispatch } from './redux/store';
import { FileApi, FileExtraction } from './detectVersion';

function UnrpaApp1() {
    const dispatch = useDispatch<AppDispatch>();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: FileExtraction[] = acceptedFiles.map(file => ({
            Id: file.name, // or any unique identifier
            Fs: new FileApi(file, (s: string) => {}),
            FileName: file.name,
            Parsed: false,
            SizeMsg: file.size + "",
        }));

        dispatch(addFiles(newFiles));
    }, [dispatch]);

    useDropzone({
        onDrop,
        noClick: true,
        preventDropOnDocument: true,
    });

    useEffect(() => {
        function handleDrop(event: DragEvent) {
            event.preventDefault();
            if (event.dataTransfer) {
                const droppedFiles = event.dataTransfer.files;
                if (droppedFiles.length) {
                    onDrop(Array.from(droppedFiles));
                }
            }
        }

        function handleDragOver(event: DragEvent) {
            event.preventDefault();
        }

        document.body.addEventListener('drop', handleDrop);
        document.body.addEventListener('dragover', handleDragOver);

        return () => {
            document.body.removeEventListener('drop', handleDrop);
            document.body.removeEventListener('dragover', handleDragOver);
        };
    }, [onDrop]);

    return (
        <div className={`container text-center `}>
            <LogProvider loggers={[
                { logFunction: DefaultExternalLoggerFunc, logLevel: LogLevel.Error },
                { logFunction: console.log, logLevel: LogLevel.Debug }
            ]}>
                <ApiInfoProvider value={defaultApiInfo}>
                    <SpinnerProvider>
                        <UnrpaApp />
                        <Logs />
                    </SpinnerProvider>
                </ApiInfoProvider>
            </LogProvider>
        </div>
    );
}

export default UnrpaApp1;
