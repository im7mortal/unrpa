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
import { FilePicker, DirectoryScanner } from './ElementChromeFilePicker';
import {DirectoryScannerF, FilePickerF} from './ElementFirefoxSafariFilePicker';
function ElementExtractionChromium() {
    // Implement your functions
    const [Archives, setArchives] = useState<FileExtraction[]>([]);
    const { recordLog } = useLogs();

    const handleFileSelection = (archives: FileExtraction[]) => {
        setArchives(archives);
    };



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
                    <FilePickerF onFileSelected={handleFileSelection} />
                    <span className={`fs-2 font-weight-bold me-3 ms-3`}>OR</span>
                    <DirectoryScanner onFileSelected={handleFileSelection} />
                    <DirectoryScannerF onFileSelected={handleFileSelection} />
                </div>
                <div className="col">
                    <span className="fs-2 font-weight-bold me-3 ms-3 invisible">DRAG AND DROP FILES</span>
                </div>
            </div>
        );
    }
}

export default ElementExtractionChromium;