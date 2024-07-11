import {ZipWriter} from "@zip.js/zip.js";
import {FileHeader} from "../unrpaLib/unrpaLibTypes";

export {};

// Use the correct global scope for Service Workers
declare const self: ServiceWorkerGlobalScope;
self.addEventListener('install', function (event) {
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

// Store for the files and groups
let filesAndGroups = new Map<string, { file: File; group: FileHeader[] }>();

function readBlobFromFileD(file: File, offset: number, length: number): Blob {
    return file.slice(offset, offset + length);
}

function createZipStream(file: File, group: FileHeader[]): ReadableStream<Uint8Array> {
    const {readable, writable} = new TransformStream<Uint8Array>();
    console.log("STARTED", file)
    // Initialize ZipWriter
    const zipWriter = new ZipWriter(writable);

    (async () => {
        for (let f of group) {
            let blob: Blob = readBlobFromFileD(file, f.Offset, f.Len);
            await zipWriter.add(f.Name, blob.stream());
        }
        // Close the ZipWriter
        await zipWriter.close();
    })();

    return readable;
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
    const {file, group, id} = event.data as { file: File; group: FileHeader[]; id: string };
    filesAndGroups.set(id, {file, group});
});

self.addEventListener("fetch", (event: FetchEvent) => {
    console.log("fetch event", event);
    let url = new URL(event.request.url);

    if (url.pathname.includes("ping")) {
        console.log("pong");
        event.respondWith(new Response("pong"));
    }

    if (url.pathname.includes("zip")) {
        const id = url.pathname.split("/unrpa/zip/")[1];
        console.log(`got zip request with id ${id} which ${filesAndGroups.has(id) ? 'exist' : 'does not exist'} in the storage`);
        if (filesAndGroups.has(id)) {
            const {file, group} = filesAndGroups.get(id)!;
            console.log(id, {file, group})
            const zipStream = createZipStream(file, group);

            event.respondWith(new Response(zipStream, {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename="${id}.zip"`
                }
            }));
        } else {
            event.respondWith(new Response("ID not found", {status: 404}));
        }
    }
});
