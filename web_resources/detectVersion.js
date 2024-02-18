async function readBlobFromFile(fileHandle, offset, length) {
    // Get a file object from the file handle
    const file = await fileHandle.getFile();
    // Slice the file to get the blob
    const blob = file.slice(offset, offset + length);
    return blob;
}

function logMessage(message) {
    // BAD IMPLEMENTATION BUT OK FOR NOW
    const logElement = document.getElementById('log');
    logElement.textContent += message + '\n'; // Append new message
    logElement.scrollTop = logElement.scrollHeight; // Auto-scroll to the bottom
}


async function saveBlobToFile(blob, fileName, directoryHandle) {
    try {
        // Create a new file handle.
        const fileHandle = await directoryHandle.getFileHandle(fileName, {create: true});
        // Create a writable stream to write to the file.
        const writable = await fileHandle.createWritable();
        // Write the blob to the file.
        await writable.write(blob);
        // Close the file.
        await writable.close();
        logMessage(`File written: ${fileName}`);
    } catch (err) {
        console.error(`Could not write file: ${fileName}`, err);
    }
}

async function ensureDirectoryHandle(directoryHandle, subPath) {
    const names = subPath.split('/').filter(p => p.length > 0); // Remove empty segments
    let currentHandle = directoryHandle;
    for (const name of names) {
        currentHandle = await currentHandle.getDirectoryHandle(name, {create: true});
    }
    return currentHandle;
}


async function run(arr, directoryHandle, fileHandle) {
    for (let i = 0; i < arr.length; i++) {
        // console.log(JSON.stringify(arr[i]))

        let fileInfo = arr[i]
        const blob = await readBlobFromFile(fileHandle, fileInfo.Offset, fileInfo.Len);
        // Ensure the directory path exists
        const subPath = fileInfo.Name.substring(0, fileInfo.Name.lastIndexOf('/'));
        const targetDirectoryHandle = await ensureDirectoryHandle(directoryHandle, subPath);

        // Extract the file name from the path
        const fileName = fileInfo.Name.substring(fileInfo.Name.lastIndexOf('/') + 1);

        // Save the blob to the file
        await saveBlobToFile(blob, fileName, targetDirectoryHandle);
    }
}

let directoryHandle = null;
let fileHandle = null;

async function chooseDirectory() {
    directoryHandle = await window.showDirectoryPicker();
}

async function chooseFile() {
    [fileHandle] = await window.showOpenFilePicker();
}

async function startProcess() {
    try {
        // Show a file picker to let the user select a file
        // Show a file picker to let the user select a file

        // Get a file object from the file handle
        const file = await fileHandle.getFile();

        // Define a size in bytes to read from the start of the file, assuming the first line is within the first 1024 bytes
        const chunkSize = 1024;
        // Create a Blob representing the first chunk of the file
        const blob = file.slice(0, chunkSize);
        // Read the chunk as text
        const textChunk = await blob.text();

        // Extract the first line from the chunk
        const firstLineEndIndex = textChunk.indexOf('\n');
        const firstLine = textChunk.substring(0, firstLineEndIndex >= 0 ? firstLineEndIndex : textChunk.length);

        // Process the first line here...
        console.log(firstLine);

        // Process the file content to detect version
        const lines = firstLine.split('\n');
        const header = lines[0];
        const parts = header.split(' ');


        // alert(stringToBigInt(parts[1]))
        // alert(stringToBigInt(parts[2]))
        console.log(stringToBigInt(parts[1]), stringToBigInt(parts[2]))

        if (parts.length < 2 || parts.length > 4) {
            alert('Expected length not valid');
            return;
        } else if (parts.length === 2) {
            alert('Version 2 detected');
            return {decoder: 'notImplemented', version: 'v2'};
        } else {
            // For simplicity, just indicate a version 3 detection
            alert('Version 3 detected; start to load to WASM');

            const offsetNumber = Number(stringToBigInt(parts[1]));
            const blobSlice = file.slice(offsetNumber);

            // Read the blob as an array buffer
            const reader = new FileReader();
            reader.onload = async function (e) {
                const arrayBuffer = e.target.result;
                const bytes = new Uint8Array(arrayBuffer);

                // Now, bytes can be sent to the WASM module
                await sendBytesToWasm(bytes, Number(stringToBigInt(parts[2])));
            };
            reader.readAsArrayBuffer(blobSlice);
            window.myApp = {
                notifyCompletion: function (result) {

                    let arr = JSON.parse(result)
                    run(arr, directoryHandle, fileHandle)

                }
            }

            return {decoder: 'v3Decoder', version: 'v3', details: {offset: parts[1], key: parts[2]}};
        }
    } catch (error) {
        console.error('Error accessing file', error);
        alert('Error processing file.');
    }
}

function stringToBigInt(hexString) {
    // Ensure the hex string length is even for proper conversion
    if (hexString.length % 2 !== 0) {
        console.error("Hex string must have an even length");
        return null;
    }

    // Convert the hex string to a BigInt
    const number = BigInt("0x" + hexString);

    return number;
}
