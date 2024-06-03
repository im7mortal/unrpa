// Import JSZip library (replace the path with your actual path to the library)
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
            resolve()
        } catch (err) {
            console.log(err)
            reject(err);
        }
    })
}

let wasmInition: Promise<void> = initWasm()

// The worker listens for the 'message' event
self.addEventListener('message', async (e: MessageEvent) => {
    try {
        if (e.data) {
            const {action, payload} = e.data;
            switch (action) {
                case 'addTask':
                    const {data, keyNumber} = payload;
                    await wasmInition;
                    self.postMessage({
                        status: 'finished',
                        content: receiveBytes(data, keyNumber)
                    })
                    break;
                default:
                    console.error('Unknown action received: ', action);
            }
        }
    } catch (err) {
        console.log(err)
    }
}, false);

export {};
