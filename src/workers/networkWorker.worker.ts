import {ZipWriter} from "@zip.js/zip.js";
import {GroupZipSort} from "../unrpaLib/unrpaGroupFunction";
export {};

// Use the correct global scope for Service Workers
declare const self: ServiceWorkerGlobalScope;
self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');
});

// Activate event
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating. !');

    // event.waitUntil(
    //     caches.keys().then(function(cacheNames) {
    //         return Promise.all(
    //             cacheNames.map(function(cacheName) {
    //                 if (cacheName !== 'my-cache') {
    //                     console.log('Deleting old cache:', cacheName);
    //                     return caches.delete(cacheName);
    //                 }
    //             })
    //         );
    //     }).then(function() {
    //         console.log('Service Worker is now active.');
    //     })
    // );
});

// Store for the files and groups
let filesAndGroups = new Map<string, { file: File; group: GroupZipSort[] }>();

function readBlobFromFileD(file: File, offset: number, length: number): Blob {
    return file.slice(offset, offset + length);
}

function createZipStream(file: File, group: GroupZipSort[]): ReadableStream<Uint8Array> {
    const {readable, writable} = new TransformStream<Uint8Array>();

    // Initialize ZipWriter
    const zipWriter = new ZipWriter(writable);

    (async () => {
        for (let entry of group) {
            for (let f of entry.entries) {
                let blob: Blob = readBlobFromFileD(file, f.Offset, f.Len);
                // Add each file entry to the ZIP
                await zipWriter.add(f.Name, blob.stream());
            }
        }
        // Close the ZipWriter
        await zipWriter.close();
    })();

    return readable;
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
    const {file, group, id} = event.data as { file: File; group: GroupZipSort[]; id: string };
    filesAndGroups.set(id, {file, group});
});

self.addEventListener("fetch", (event: FetchEvent) => {
    console.log("fetch event", event);
    let url = new URL(event.request.url);

    if (url.pathname.startsWith("unrpa/static/js/lol")) {
        console.log("GATOS");
        event.respondWith(new Response("lol efe"));
    }

    if (url.pathname.startsWith("/unrpa/zip/")) {
        console.log("MIU<MIU");
        return;

        const id = url.pathname.split("/unrpa/zip/")[1];
        if (filesAndGroups.has(id)) {
            const {file, group} = filesAndGroups.get(id)!;

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
