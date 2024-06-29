import React, {useState, useContext} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import {useLogs} from './LogProvider';

import {FileExtraction} from './detectVersion';
import ElementArchiveExtraction from "./ElementArchiveExtraction";
import {FilePicker} from './ElementFilePicker';
import {DirectoryScanner} from './ElementDirectoryPicker';
import {FilesContext} from "./DropdownFilesContext";

function ElementExtractionChromium() {
    const {recordLog} = useLogs();

    const {files, dispatch} = useContext(FilesContext);

    const handleFileSelection = (fExtraction: FileExtraction) => {
        dispatch({type: 'ADD', payload: fExtraction});
    };


    if (files.length !== 0) {
        return (
            <div>
                {files.map((item: FileExtraction, index: number) => (
                    <ElementArchiveExtraction
                        fClassE={item}
                        logF={recordLog}
                        handleRemove={() => {
                            dispatch({type: 'REMOVE', payload: item.Id})
                        }}
                        key={item.Id}
                    />
                ))}
            </div>);
    } else {
        return (
            <div>
                <div className="col">
                    <FilePicker onFileSelected={handleFileSelection}/>
                    <span className={`fs-2 font-weight-bold me-3 ms-3`}>OR</span>
                    <DirectoryScanner onFileSelected={handleFileSelection}/>
                </div>
                <div className="col">
                    <span className="fs-2 font-weight-bold me-3 ms-3 invisible">DRAG AND DROP FILES</span>
                </div>
            </div>
        );
    }
}

export default ElementExtractionChromium;