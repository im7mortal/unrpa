import {ZipWriter} from "@zip.js/zip.js";
import type {FileHeader} from "../unrpaLib/unrpaLibTypes";

export {};

// Use the correct global scope for Service Workers
declare const self: ServiceWorkerGlobalScope & {
    __WB_MANIFEST: Array<{url: string; revision: string | null}>;
};
// Injection point for workbox manifest during build.
self.__WB_MANIFEST;
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

function createZipStream(id: string, file: File, group: FileHeader[]): ReadableStream<Uint8Array> {
    const {readable, writable} = new TransformStream<Uint8Array>();
    console.log("STARTED", file);
    // Initialize ZipWriter
    let zipWriter: ZipWriter<Uint8Array> | null = new ZipWriter(writable);

    (async () => {
        try {
            for (let f of group) {
                let blob: Blob = readBlobFromFileD(file, f.Offset, f.Len);
                await zipWriter!.add(f.Name, blob.stream());
            }
        } catch (error: any) {
            console.error("Streaming error:", error);
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({id, status: 'error', message: error.message || String(error)});
            });
        } finally {
            if (zipWriter) {
                await zipWriter.close();
                zipWriter = null;
            }

            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({id, status: 'downloaded'});
            });
        }
    })();

    return readable;
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
    const {file, group, id} = event.data as { file: File; group: FileHeader[]; id: string };

    if (id === "ping") {
        console.log(`pong`);
        return;
    }

    filesAndGroups.set(id, {file, group});
});

self.addEventListener("fetch", (event: FetchEvent) => {
    const url = new URL(event.request.url);

    if (url.pathname.endsWith("/ping")) {
        console.log("pong");
        event.respondWith(new Response("pong"));
        return;
    }

    if (url.pathname.includes("/unrpa/zip/")) {
        const id = url.pathname.split("/unrpa/zip/")[1];
        console.log(`got zip request with id ${id} which ${filesAndGroups.has(id) ? 'exist' : 'does not exist'} in the storage`);
        if (filesAndGroups.has(id)) {
            const {file, group} = filesAndGroups.get(id)!;
            console.log(id, {file, group})
            const zipStream = createZipStream(id, file, group);
            filesAndGroups.delete(id); // Clear memory after starting the stream

            event.respondWith(new Response(zipStream, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${id}.zip"`,
                    'Content-Security-Policy': "default-src 'none'",
                    'X-Content-Type-Options': 'nosniff',
                    'Cache-Control': 'no-store'
                }
            }));
        } else {
            event.respondWith(new Response("ID not found", {status: 404}));
        }
    }
});
