declare var bowser: any;
declare var receiveBytes: (input: Uint8Array, key: number) => void;
declare var Go: any;

let onMetadataSuccess = function (): void {
    setButtonActiveGreen("filePick2");
    setButtonActiveBlue("startD")
}

let onExtractionSuccess = function (): void {
    setButtonActiveGreen("startD")
}
const fw = getFW()

function getFW(): any {
    const browser = bowser.getParser(window.navigator.userAgent);
    let b = browser.getBrowserName();
    if (b === "Safari" || b === "Firefox") {
        return new FileApi(logMessage, sendBytesToWasm, onMetadataSuccess, onExtractionSuccess)
    } else {
        return new FileSystemAccessApi(logMessage, sendBytesToWasm, onMetadataSuccess, onExtractionSuccess);
    }
}


async function sendBytesToWasm(bytes: Uint8Array, key: number): Promise<void> {
    receiveBytes(bytes, key);
}

const go = new Go();
let wasmModule: any;

async function initWasm(wasm_path: string): Promise<void> {
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
        const version = browser.getBrowserVersion();
        console.log(version);
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


async function chooseFile(): Promise<void> {
    let [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    await fw.extractMetadata(file)
    setButtonActiveGreen("filePick")
    setButtonActiveBlue("dirrPick")
    setButtonDisabled("start")
}


async function chooseDirectory(f): Promise<void> {
    const directoryHandle = await window.showDirectoryPicker();
    f.setDir(directoryHandle);
    setButtonActiveGreen("dirrPick")
    setButtonActiveBlue("start")
}

async function scanDirectory(): Promise<void> {
    console.log("scan directory preinit")
    const directoryHandle = await window.showDirectoryPicker();

    const files = await fw.scanDir(directoryHandle);

    await createFilesList(files)
}

async function createFilesList(files): Promise<void> {
    console.log(files)
    const container = document.getElementById('options');
    const system_access_extraction = document.getElementById('system_access_extraction');

    for (let index = 0; index < files.length; index++) {

        if (!files[index].name.endsWith('.rpa')) continue;

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

        let localFsa = getFW()

        try {
            console.log(files[index])
            await localFsa.extractMetadata(files[index])


            // this.logMessage("Successfully parsed metadata. " + this.Metadata.length + " files are ready to extraction")
        } catch (err) {
            console.log("An error occurred:" + err)
            continue
        }


        directoryButton.onclick = function () {
            chooseDirectory(localFsa);
            directoryButton.className = "button-green"
            extractButton.disabled = false;
        };
        extractButton.onclick = async function () {
            await localFsa.extract();
            extractButton.className = "button-green";
        };

        colDiv.appendChild(fileButton);
        if (localFsa.constructor.name === "FileSystemAccessApi") {
            colDiv.appendChild(directoryButton);
            extractButton.disabled = true
        }
        colDiv.appendChild(extractButton);
        extractionRowDiv.appendChild(colDiv);
        console.log(container.childNodes)

        container.insertBefore(extractionRowDiv, container.childNodes[4]);
        system_access_extraction.style.display = "none"
    }
}

function chooseFileD(): void {
    document.getElementById("fileInput").click();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        document.getElementById('fileInput').addEventListener('change', function () {
            if (!this.files.length) {
                alert('Please select a file.');
                return;
            }
            fw.extractMetadata(this.files[0])
        });
    } catch (error) {
        console.error('Error 56');
    }
})

document.addEventListener('DOMContentLoaded', async () => {
    var dropZone = document.getElementById('drop_zone');
    var overlay = document.getElementById("overlay");

    function dragOverHandler(evt): void {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
        overlay.style.display = "block";
    }

    function dragLeaveHandler(evt): void {
        evt.stopPropagation();
        evt.preventDefault();
    }

    async function handleFileSelect(evt): Promise<void> {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer.files;
        overlay.style.display = "none";
        await createFilesList(files)
    }

    dropZone.addEventListener('dragover', dragOverHandler, false);
    dropZone.addEventListener('dragleave', dragLeaveHandler, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
})

function logMessage(message: string): void {
    const logElement = document.getElementById('log');
    logElement.textContent += message + '\n';
    logElement.scrollTop = logElement.scrollHeight;
}

function setButtonDisabled(id: string): void {
    const button = document.getElementById(id);
    button.disabled = true;
    button.classList.remove('button-blue', 'button-green');
}

function setButtonActiveBlue(id: string): void {
    const button = document.getElementById(id);
    button.disabled = false;
    button.classList.remove('button-green');
    button.classList.add('button-blue');
}

function setButtonActiveGreen(id: string): void {
    const button = document.getElementById(id);
    button.disabled = false;
    button.classList.remove('button-blue');
    button.classList.add('button-green');
}