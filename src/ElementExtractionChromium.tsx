import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {v4 as uuidv4} from 'uuid';

import { useLogs } from './LogProvider';

import {
    FileSystemAccessApi,
    MetadataResponse,
    FileSystemAccessApiInterface,
    scanDir, FileExtraction
} from './detectVersion';
import ElementArchiveExtraction from "./ElementArchiveExtraction";
import { FilePicker } from './ElementChromeFilePicker';
function ElementExtractionChromium() {
    // Implement your functions
    const [Archives, setArchives] = useState<FileExtraction[]>([]);
    const { recordLog } = useLogs();

    const handleFileSelection = (archives: FileExtraction[]) => {
        setArchives(archives);
    };

    const scan = async () => {
        if (window.showDirectoryPicker) {
            try {
                setArchives(await scanDir(await window.showDirectoryPicker(), recordLog));
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    console.log('Directory picker was cancelled');
                } else {
                    // Handle any other errors
                    console.error(err);
                }
            }
        } else {
            console.log('Directory picker is not supported in this browser');
        }
    }


    if (Archives.length !== 0) {
        return (
            <div>
                {Archives.map((item: FileExtraction, index: number) => (
                    <ElementArchiveExtraction fClassE={item} logF={recordLog} handleRemove={() => {
                        setArchives(Archives.filter((_, i) => i !== index))  // This will remove current item from Archives
                    }} key={item.Id}/>
                ))}
            </div>);
    } else {
        return (
            <div>
                <div className="col">
                    <FilePicker onFileSelected={handleFileSelection} />
                    <span className={`fs-2 font-weight-bold me-3 ms-3`}>OR</span>
                    <button id="selectDirectory" className="btn btn-primary" onClick={scan}>Scan
                        directory
                    </button>
                </div>
                <div className="col">
                    <span className="fs-2 font-weight-bold me-3 ms-3 invisible">DRAG AND DROP FILES</span>
                </div>
            </div>
        );
    }
}

export default ElementExtractionChromium;