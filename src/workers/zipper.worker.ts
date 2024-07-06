// Import JSZip library (replace the path with your actual path to the library)
import {FileHeader} from "../unrpaLib/unrpaLibTypes";
import * as workerpool from 'workerpool';
import {LogLevel} from "../logInterface";
import {GroupZipSort, ZipWorkerOut} from "../detectVersion";

importScripts("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js");


declare var JSZip: any;


async function readBlobFromFileD(file: File, offset: number, length: number) {
    return file.slice(offset, offset + length);
}

async function createZip(file: File, group: GroupZipSort[]): Promise<ZipWorkerOut> {
// Initialize JSZip
    let zip = new JSZip();
    let zipIndex: number = 0;
    console.log(group)
    for (let entry of group) {
        // if (self.canceled) {
        //     this.logMessage(`EXTRACTON CANCELED`, LogLevel.Info)
        //     return
        // }
        for (let f of entry.entries) {
            let blob: Blob = await readBlobFromFileD(file, f.Offset, f.Len);
            console.log(f.Name, blob.size)
            zip.file(f.Name, blob);
        }
    }

    let lastPercent = 0;
    const content: Blob = await zip.generateAsync({
            type: "blob",
            compression: "STORE"
        }, function updateCallback(metadata: any): void {
            // Check if the current percentage is different from the last reported
            if (metadata.percent.toFixed() !== lastPercent.toFixed()) {
                lastPercent = metadata.percent
                // Update progress
                let msg = "Progression zip " + zipIndex + ": " + metadata.percent.toFixed(2) + " %";
                if (metadata.currentFile) {
                    msg += "\t" + metadata.currentFile;
                }
                // eslint-disable-next-line no-restricted-globals
                // self.postMessage({status: 'progress', content: msg});
            }
        }
    );
    return {content: content, zipIndex: zipIndex}
}

workerpool.worker({
    zip: createZip
});
export {};


export {};