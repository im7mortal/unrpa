import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { injectManifest } from 'rollup-plugin-workbox';

export default defineConfig(() => {
    return {
        base: '/unrpa/',
        build: {
            outDir: 'build',
        },
        server: {
            port: 5173,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow all origins, adjust as needed
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
            },
        },
        plugins: [
            react(),
            injectManifest({
                swSrc: 'src/workers/networkWorker.worker.ts',
                swDest: 'build/service-worker.js',
                globDirectory: 'build',
            }),
        ],
    };
});
