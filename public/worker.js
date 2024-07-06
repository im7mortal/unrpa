self.addEventListener("fetch", event => {
  console.log("fetch event", event);
  let url = new URL(event.request.url);
  if (url.pathname.startsWith("/test")) {
    event.respondWith(new Response("Hello from worker!"));
  }
  if (event.request.url.endsWith('/hey')) {
    const iterations = 200; // Number of iterations
    const chunkSize = 1024 * 1024; // 1 MB
    const textChunk = new Uint8Array(chunkSize).fill(65); // Fill with ASCII character 'A'

    const stream = new ReadableStream({
      start(controller) {
        async function pushChunk(i) {
          if (i < iterations) {
            controller.enqueue(textChunk);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            pushChunk(i + 1);
          } else {
            controller.close();
          }
        }

        pushChunk(0);
      }
    });

    event.respondWith(new Response(stream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="large-file.txt"'
      }
    }));
  }
});
