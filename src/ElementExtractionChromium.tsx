import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import {useLogs} from './LogProvider';

import {FileExtraction} from './detectVersion';
import ElementArchiveExtraction from "./ElementArchiveExtraction";
import {FilePicker, DirectoryScanner} from './ElementChromeFilePicker';

function ElementExtractionChromium() {
    // Implement your functions
    const [Archives, setArchives] = useState<FileExtraction[]>([]);
    const {recordLog} = useLogs();

    const handleFileSelection = (newFiles: FileExtraction) => {
        setArchives(prevArchives => {
            const existingIndex = prevArchives.findIndex(file => file.Id === newFiles.Id);
            if (existingIndex >= 0) {
                return prevArchives.map((file, index) => index === existingIndex ? newFiles : file);
            } else {
                return [...prevArchives, newFiles];
            }
        });
    };


    if (Archives.length !== 0) {
        return (
            <div>
                {Archives.map((item: FileExtraction, index: number) => (
                    <ElementArchiveExtraction
                        fClassE={item}
                        logF={recordLog}
                        handleRemove={() => {
                            setArchives(Archives.filter((_, i) => i !== index)); // This will remove current item from Archives
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