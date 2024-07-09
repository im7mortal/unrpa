declare function importScripts(...urls: string[]): void;

importScripts("wasm_exec.js");
declare var receiveBytes: (input: Uint8Array, key: number) => string;
let wasmModule: WebAssembly.Instance;
const go: Go = new Go();

async function initWasm(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const resp = await fetch('unrpa.wasm');
            const wasm = await WebAssembly.instantiateStreaming(resp, go.importObject);
            wasmModule = wasm.instance;
            go.run(wasmModule);
            resolve();
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

const wasmInitiation: Promise<void> = initWasm();

export async function parseMetadata(input: Uint8Array, key: number): Promise<string> {
    await wasmInitiation;
    return receiveBytes(input, key)
}
