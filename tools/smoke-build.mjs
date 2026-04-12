import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const buildDir = path.join(root, 'build');
const assetsDir = path.join(buildDir, 'assets');
const serviceWorker = path.join(buildDir, 'service-worker.js');

function fail(msg) {
  console.error(`[smoke] FAIL: ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(buildDir)) fail('build directory is missing; run npm run build first');
if (!fs.existsSync(serviceWorker)) fail('service-worker.js is missing in build output');
if (!fs.existsSync(assetsDir)) fail('build/assets directory is missing');

const assets = fs.readdirSync(assetsDir);
const hasMetadataWorker = assets.some((f) => /^metadataParser\.worker-.*\.js$/.test(f));
const hasZipperWorker = assets.some((f) => /^zipper\.worker-.*\.js$/.test(f));

if (!hasMetadataWorker) fail('metadataParser worker bundle is missing');
if (!hasZipperWorker) fail('zipper worker bundle is missing');

console.log('[smoke] PASS: build contains service worker + worker bundles');
