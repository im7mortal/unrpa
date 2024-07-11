export {};
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', e => {
    console.log(e.type);
    self.skipWaiting(); // Always activate updated SW immediately
});

self.addEventListener('activate', e => {
    console.log(e.type);
    console.log("GETTTOAGA");
    e.waitUntil(self.clients.claim()); // Take control immediately
});

self.addEventListener('message', e => {
    console.log(e.type, e.data);
    console.log("INNNER");
});

self.addEventListener('fetch', (event: FetchEvent) => {
    console.log('fetch event', event);
    console.log('GATOS');
    let url = new URL(event.request.url);
    if (url.pathname.includes("lol")) {
        event.respondWith(
            new Response('lol efe')
        );
    }
});