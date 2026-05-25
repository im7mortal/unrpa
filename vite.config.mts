import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {injectManifest} from 'rollup-plugin-workbox'
import {fileURLToPath, URL} from 'node:url';

const shimNodeOsPath = fileURLToPath(new URL('./src/shims/node-os.ts', import.meta.url));
const shimNodeEmptyPath = fileURLToPath(new URL('./src/shims/node-empty.ts', import.meta.url));

export default defineConfig(() => {
    return {
        base: '/unrpa/',
        resolve: {
            alias: {
                os: shimNodeOsPath,
                'node:os': shimNodeOsPath,
                child_process: shimNodeEmptyPath,
                'node:child_process': shimNodeEmptyPath,
                worker_threads: shimNodeEmptyPath,
                'node:worker_threads': shimNodeEmptyPath,
            },
        },
        build: {
            outDir: 'build',
            target: 'baseline-widely-available',
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
                            return 'vendor-react';
                        }
                        if (
                            id.includes('node_modules/i18next') ||
                            id.includes('node_modules/react-i18next') ||
                            id.includes('node_modules/i18next-browser-languagedetector')
                        ) {
                            return 'vendor-i18n';
                        }
                        if (
                            id.includes('node_modules/workerpool') ||
                            id.includes('node_modules/@zip.js') ||
                            id.includes('node_modules/pako') ||
                            id.includes('node_modules/pickleparser') ||
                            id.includes('node_modules/jsbi')
                        ) {
                            return 'vendor-workers';
                        }
                    },
                },
            },
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
