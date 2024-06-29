import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import {useLogs} from './LogProvider';

import {FileExtraction} from './detectVersion';
import ElementArchiveExtraction from "./ElementArchiveExtraction";
import {FilePicker} from './ElementFilePicker';
import {DirectoryScanner} from './ElementDirectoryPicker';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './redux/store';
import {addFiles, removeFile} from "./redux/reducers";

function ElementExtractionChromium() {

    const archives = useSelector((state: RootState) => state.files.archives);
    const dispatch = useDispatch<AppDispatch>();

    // Implement your functions
    const {recordLog} = useLogs();

    const handleFileSelection = (newFiles: FileExtraction) => {
        dispatch(addFiles([newFiles]));
    };


    if (archives.length !== 0) {
        return (
            <div>
                {archives.map((item: FileExtraction, index: number) => (
                    <ElementArchiveExtraction
                        fClassE={item}
                        logF={recordLog}
                        handleRemove={() => {
                            dispatch(removeFile(item.Id))
                        }}
                        key={item.Id}
                    />
                ))}            </div>);
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