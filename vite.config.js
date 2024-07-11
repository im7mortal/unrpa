import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {injectManifest} from 'rollup-plugin-workbox'


export default defineConfig(() => {
    return {
        base: '/unrpa/',
        build: {
            outDir: 'build',
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
