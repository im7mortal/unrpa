import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {injectManifest} from 'rollup-plugin-workbox'


export default defineConfig(() => {
    return {
        base: '/unrpa/',
        resolve: {
            alias: {
                os: '/src/shims/node-os.ts',
                'node:os': '/src/shims/node-os.ts',
                child_process: '/src/shims/node-empty.ts',
                'node:child_process': '/src/shims/node-empty.ts',
                worker_threads: '/src/shims/node-empty.ts',
                'node:worker_threads': '/src/shims/node-empty.ts',
            },
        },
        build: {
            outDir: 'build',
            target: 'baseline-widely-available',
        },
        server: {
            port: 5173
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
