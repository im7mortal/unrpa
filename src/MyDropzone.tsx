// MyDropzone.tsx

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const MyDropzone: React.FC = () => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Do something with the files
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
                // Do whatever you want with the file contents
                const binaryStr = reader.result;
                console.log(binaryStr);
            }
            reader.readAsArrayBuffer(file);
        });

    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div {...getRootProps()} style={{
            border: '2px dashed gray',
            borderRadius: '1em',
            padding: '1em',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.1)' : 'transparent'
        }}>
            <input {...getInputProps()} />
            {
                isDragActive ?
                    <p>Drop the files here...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
            }
        </div>
    );
};

export default MyDropzone;