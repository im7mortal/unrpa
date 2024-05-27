// Import JSZip library (replace the path with your actual path to the library)
importScripts("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js");
declare var JSZip: any;
// Initialize JSZip
let zip = new JSZip();
let zipIndex: number = 0;

// The worker listens for the 'message' event
self.addEventListener('message', (e: MessageEvent) => {
    if (e.data) {
        const {action, payload} = e.data;

        switch (action) {
            case 'addTask':
                const {filename, data} = payload;
                zip.file(filename, data);
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
    const content: Blob = await zip.generateAsync({
            type: "blob",
            compression: "STORE"
        }, function updateCallback(metadata: any) : void {
            // Check if the current percentage is different from the last reported
            if (metadata.percent.toFixed() !== lastPercent.toFixed()) {
                lastPercent = metadata.percent
                // Update progress
                let msg = "Progression zip " + zipIndex + ": " + metadata.percent.toFixed(2) + " %";
                if (metadata.currentFile) {
                    msg += "\t" + metadata.currentFile;
                }
                self.postMessage({status: 'progress', content: msg});
            }
        }
    );
    self.postMessage({status: 'finished', content: content, zipIndex: zipIndex});

}