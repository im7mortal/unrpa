import React, {useContext} from 'react';
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
            </div>
        );
    }
}

export default ElementExtraction;