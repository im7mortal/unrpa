// Import JSZip library (replace the path with your actual path to the library)
importScripts("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js");

// Initialize JSZip
let zip = new JSZip();
let tasks = [];
let zipIndex = 0;

// The worker listens for the 'message' event
self.addEventListener('message', (e) => {
    if (e.data) {
        const {action, payload} = e.data;

        switch (action) {
            case 'addTask':
                const {filename, data} = payload;
                zip.file(filename, data);
                console.log("get chank")
                break;
            case 'finalize':
                zipIndex = e.data.zipIndex
                finalizeZip();
                break;
            default:
                console.error('Unknown action received: ', action);
        }
    }
}, false);

async function finalizeZip() {
    let lastPercent = 0;
    const content = await zip.generateAsync({
            type: "blob",
            compression: "STORE"
        }, function updateCallback(metadata) {
            // Check if the current percentage is different from the last reported
            if (metadata.percent.toFixed() !== lastPercent.toFixed()) {
                lastPercent = metadata.percent
                // Update progress
                let msg = "Progression zip " + zipIndex + ": " + metadata.percent.toFixed(2) + " %";
                if (metadata.currentFile) {
                    msg += "\t" + metadata.currentFile;
                }
                console.log(msg);
                self.postMessage({ status: 'progress',  content: msg});
            }
        }
    );
    console.log("DONE ON WORKER SIDE")
    self.postMessage({ status: 'finished',  content: content, zipIndex: zipIndex});

}