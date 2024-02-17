async function detectVersionWithFileSystemAccess() {
    try {
        // Show a file picker to let the user select a file
        // Show a file picker to let the user select a file
        const [fileHandle] = await window.showOpenFilePicker();
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
            reader.onload = async function(e) {
                const arrayBuffer = e.target.result;
                const bytes = new Uint8Array(arrayBuffer);

                // Now, bytes can be sent to the WASM module
                await sendBytesToWasm(bytes, Number(stringToBigInt(parts[2])));
            };
            reader.readAsArrayBuffer(blobSlice);


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
