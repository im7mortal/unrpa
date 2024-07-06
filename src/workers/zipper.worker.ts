import { BlobReader, ZipWriter } from "@zip.js/zip.js";
import * as workerpool from 'workerpool';
import { LogLevel } from "../logInterface";
import { ZipWorkerOut } from "../detectVersion";
import {GroupZipSort} from "../unrpaLib/unrpaGroupFunction";

async function readBlobFromFileD(file: File, offset: number, length: number) {
    return file.slice(offset, offset + length);
}

async function createZip(file: File, group: GroupZipSort[], zipIndex: number): Promise<ZipWorkerOut> {
    // Initialize the TransformStream for writing the ZIP file
    const zipFileStream = new TransformStream();
    const zipFileBlobPromise = new Response(zipFileStream.readable).blob();

    // Initialize ZipWriter
    const zipWriter = new ZipWriter(zipFileStream.writable);

    for (let entry of group) {
        for (let f of entry.entries) {
            let blob: Blob = await readBlobFromFileD(file, f.Offset, f.Len);
            // Add each file entry to the ZIP
            await zipWriter.add(f.Name, blob.stream());
        }
    }

    // Close the ZipWriter
    await zipWriter.close();

    // Get the final ZIP Blob
    const content: Blob = await zipFileBlobPromise;

    // Return the ZIP Blob and the index
    return { content: content, zipIndex: zipIndex };
}

workerpool.worker({
    zip: createZip
});

export {};
