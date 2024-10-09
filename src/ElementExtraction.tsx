import React, {useContext, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import {useLogs} from './ContextLog';

import {FileExtraction} from './detectVersion';
import ElementArchiveExtraction from "./ElementArchiveExtraction";
import {FilePicker} from './ElementFilePicker';
import {DirectoryScanner} from './ElementDirectoryPicker';
import {FilesContext} from "./ContextDropdownFiles";
import {useTranslation} from "react-i18next";

function ElementExtraction() {
    const {t} = useTranslation();
    const {recordLog} = useLogs();

    const {files, dispatch} = useContext(FilesContext);

    // State for input text and date pickers
    const [inputText, setInputText] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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
                    <span className={`fs-2 font-weight-bold me-3 ms-3`}>{t('or')}</span>
                    <DirectoryScanner onFileSelected={handleFileSelection}/>
                </div>
                <div className="col">
                    <span className="fs-2 font-weight-bold me-3 ms-3 ">{t('dragAndDrop')} 📂</span>
                </div>

                {/* Added input text and date pickers below */}
                <div className="col mt-4">
                    <label htmlFor="inputText" className="form-label">Input Text:</label>
                    <input
                        type="text"
                        id="inputText"
                        className="form-control"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter some text"
                    />
                </div>
                <div className="col mt-4">
                    <label htmlFor="startDate" className="form-label">Start Date:</label>
                    <input
                        type="date"
                        id="startDate"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="col mt-4">
                    <label htmlFor="endDate" className="form-label">End Date:</label>
                    <input
                        type="date"
                        id="endDate"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
        );
    }
}

export default ElementExtraction;
