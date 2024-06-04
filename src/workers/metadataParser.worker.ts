import * as workerpool from 'workerpool';

declare function importScripts(...urls: string[]): void;

importScripts("wasm_exec.js");

declare var receiveBytes: (input: Uint8Array, key: number) => string;
let wasmModule: any;
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

let wasmInition: Promise<void> = initWasm();

async function addTask(data: Uint8Array, keyNumber: number): Promise<any> {
    await wasmInition;
    const result = receiveBytes(data, keyNumber);
    return {status: 'finished', content: result};
}

// expose the function through workerpool
workerpool.worker({
    addTask: addTask
});
export {};
