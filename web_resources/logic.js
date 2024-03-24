let onMetadataSuccess = function () {
    setButtonActiveGreen("filePick2");
    setButtonActiveBlue("startD")
}

let onExtractionSuccess = function () {
    setButtonActiveGreen("startD")
}

const fa = new FileApi(onMetadataSuccess, onExtractionSuccess);
const fsa = new FileSystemAccessApi(onMetadataSuccess, onExtractionSuccess);


async function sendBytesToWasm(bytes, key) {
    // Assuming wasmModule is your instantiated WASM module
    // And receiveBytes is a function you've exposed from Go
    receiveBytes(bytes, key);
}

const go = new Go();
let wasmModule;

async function initWasm(wasm_path) {
    const resp = await fetch('wasm/unrpa.wasm');
    const wasm = await WebAssembly.instantiateStreaming(resp, go.importObject);
    wasmModule = wasm.instance;
    go.run(wasmModule);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const browser = bowser.getParser(window.navigator.userAgent);
    if (!('showOpenFilePicker' in window)) {
        document.getElementById('system_access_extraction').style.display = 'none';
        if (browser.getPlatformType() === "mobile") {
            document.getElementById('mobile').style.display = '';
        } else {
            let b = browser.getBrowserName();
            if (b === "Safari" || b === "Firefox") {
                document.getElementById("Firefox").style.display = '';
            }
        }
        // Get browser version
        const version = browser.getBrowserVersion();
        console.log(version); // e.g., "88.0.4324.150"
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('resources.json');
        const resources = await response.json();
        const linuxExeLink = document.getElementById('linux_exe').querySelector('a');
        if (resources.linux_exe) {
            linuxExeLink.href = resources.linux_exe;
        } else {
            console.log('Linux executable URL not found.');
        }
        const windows_exeLink = document.getElementById('windows_exe').querySelector('a');
        if (resources.windows_exe) {
            windows_exeLink.href = resources.windows_exe;
        } else {
            windows_exeLink.style.display = 'none';
            console.log('Windows executable URL not found.');
        }
        initWasm(resources.wasm)

    } catch (error) {
        console.error('Failed to load resources:', error);
    }
});


async function chooseFile() {
    [fileHandle] = await window.showOpenFilePicker();

    // Get a file object from the file handle
    const file = await fileHandle.getFile();
    await fsa.extractMetadata(file)
    setButtonActiveGreen("filePick")
    setButtonActiveBlue("dirrPick")
    setButtonDisabled("start")
}


async function chooseDirectory(f) {
    const directoryHandle = await window.showDirectoryPicker();

    f.setDir(directoryHandle);

    setButtonActiveGreen("dirrPick")
    setButtonActiveBlue("start")
}

async function scanDirectory() {
    console.log("scan directory preinit")
    const directoryHandle = await window.showDirectoryPicker();

    const files = await fsa.scanDir(directoryHandle);

    console.log(files)
    const container = document.getElementById('options');
    const system_access_extraction = document.getElementById('system_access_extraction');

    for (let index = 0; index < files.length; index++) {
        const extractionRowDiv = document.createElement('div');
        extractionRowDiv.className = "row justify-content-center";

        const colDiv = document.createElement('div');
        colDiv.className = "col";

        let fileButton = document.createElement('button');
        fileButton.className = "button-green";
        fileButton.innerText = files[index].name;


        let directoryButton = document.createElement('button');
        directoryButton.innerText = "To directory";


        let extractButton = document.createElement('button');
        extractButton.innerText = "Extract";


        let localFsa = new FileSystemAccessApi(function () {
            directoryButton.className = "button-green"
        }, onExtractionSuccess)

        try {
            console.log(files[index])
            await localFsa.extractMetadata(files[index])
        } catch (err) {
            console.log("An error occurred:" + err)
            continue
        }


        directoryButton.onclick = function () {
            chooseDirectory(localFsa);
            directoryButton.className = "button-green"
        };
        extractButton.onclick = async function () {
            await localFsa.extract();
            extractButton.className = "button-green";
        };

        colDiv.appendChild(fileButton);
        colDiv.appendChild(directoryButton);
        colDiv.appendChild(extractButton);
        extractionRowDiv.appendChild(colDiv);
        console.log(container.childNodes)
        // Insert the new div between row1 and row2
        container.insertBefore(extractionRowDiv, container.childNodes[4]);

        system_access_extraction.style.display = "none"
    }

    // setButtonActiveGreen("dirrPick")
    // setButtonActiveBlue("start")
}


function chooseFileD() {
    document.getElementById("fileInput").click();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        document.getElementById('fileInput').addEventListener('change', function () {
            if (!this.files.length) {
                alert('Please select a file.');
                return;
            }
            fa.extractMetadata(this.files[0])
        });
    } catch (error) {
        console.error('Error 56');
    }
})

function logMessage(message) {
    // BAD IMPLEMENTATION BUT OK FOR NOW
    const logElement = document.getElementById('log');
    logElement.textContent += message + '\n'; // Append new message
    logElement.scrollTop = logElement.scrollHeight; // Auto-scroll to the bottom
}

function setButtonDisabled(id) {
    const button = document.getElementById(id);
    button.disabled = true;
    button.classList.remove('button-blue', 'button-green');
}

function setButtonActiveBlue(id) {
    const button = document.getElementById(id);
    button.disabled = false;
    button.classList.remove('button-green');
    button.classList.add('button-blue');
}

function setButtonActiveGreen(id) {
    const button = document.getElementById(id);
    button.disabled = false;
    button.classList.remove('button-blue');
    button.classList.add('button-green');
}


