import React, { useState, useContext , useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLogs } from './LogProvider';
import {FileApi, FileExtraction, FileSystemAccessApiInterface} from './detectVersion';
import ElementArchiveExtraction from "./ElementArchiveExtraction";
import { DirectoryScannerF, FilePickerF } from './ElementFirefoxSafariFilePicker';
import DropdownFilesContext from './DropdownFilesContext';
import {v4 as uuidv4} from 'uuid';

function ElementExtractionChromium() {
    // Implement your functions
    const [Archives, setArchives] = useState<FileExtraction[]>([]);
    const {recordLog} = useLogs();
    const files = useContext(DropdownFilesContext);

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

    useEffect(() => {
        files.forEach(file => {
            handleFileSelection({
                Firefox: true,
                Id: uuidv4(),
                Fs: new FileApi(() => {}),
                FileName: file.name,
                Parsed: false,
                SizeMsg: "" + file.size,
            });
        });
    }, [files]);;


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
                    <FilePickerF onFileSelected={handleFileSelection}/>
                    <span className={`fs-2 font-weight-bold me-3 ms-3`}>OR</span>
                    <DirectoryScannerF onFileSelected={handleFileSelection}/>
                </div>
                <div className="col">
                    <span className="fs-2 font-weight-bold me-3 ms-3 invisible">DRAG AND DROP FILES</span>
                </div>
            </div>
        );
    }
}

export default ElementExtractionChromium;