import { BlobReader, ZipWriter } from "@zip.js/zip.js";
import * as workerpool from 'workerpool';
import type { ZipWorkerOut } from "../detectVersion";
import type {GroupZipSort} from "../unrpaLib/unrpaGroupFunction";

async function readBlobFromFileD(file: File, offset: number, length: number) {
    return file.slice(offset, offset + length);
}

async function createZip(file: File, group: GroupZipSort[], zipIndex: number): Promise<ZipWorkerOut> {
    // Initialize the TransformStream for writing the ZIP file
    const zipFileStream = new TransformStream();
    const zipFileBlobPromise = new Response(zipFileStream.readable).blob();

    // Initialize ZipWriter
    let zipWriter: ZipWriter | null = new ZipWriter(zipFileStream.writable);

    try {
        for (let entry of group) {
            for (let f of entry.entries) {
                let blob: Blob = await readBlobFromFileD(file, f.Offset, f.Len);
                // Add each file entry to the ZIP
                await zipWriter.add(f.Name, blob.stream());
            }
        }
    } finally {
        // Close the ZipWriter
        if (zipWriter) {
            await zipWriter.close();
            zipWriter = null;
        }
    }

    // Get the final ZIP Blob
    const content: Blob = await zipFileBlobPromise;

    // Return the ZIP Blob and the index
    return { content: content, zipIndex: zipIndex };
}

workerpool.worker({
    zip: createZip
});

export {};
