// File: networkWorker.sw.ts
export {};

// Use the correct global scope for Service Workers
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event: ExtendableEvent) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
    console.log('Service Worker activating.');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event: FetchEvent) => {
    console.log('PERRO');
    console.log('PERRO');
    console.log('PERRO');
    console.log('PERRO');
    console.log('PERRO');
    console.log('Fetch event:', event);

    if (event.request.url.includes('downloadZip') ) {
        event.respondWith(
            new Response('Hello, World!', {
                headers: { 'Content-Type': 'text/plain' }
            })
        );
    }
});


// Handle messages from the main script
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    console.log('Message received in Service Worker YO PERROS:', event.data);
});