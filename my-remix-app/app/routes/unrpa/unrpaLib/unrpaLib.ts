// import {parseMetadata} from "./unrpaLibMetadataParseWASM"
import {parseMetadata} from "./unrpaLibMetadataParseNative"
import {FileHeader} from "./unrpaLibTypes"


interface RPAHeader {
    offsetNumber: number,
    keyNumber: number
    Error: string,
}

function newRPAHeader(offsetNumber: number, keyNumber: number, err: string): RPAHeader {
    return {
        offsetNumber: offsetNumber,
        keyNumber: keyNumber,
        Error: err
    }
}

function failedRPAHeader(err: string): RPAHeader {
    return {
        offsetNumber: 0,
        keyNumber: 0,
        Error: err
    }
}

export interface MetadataResponse {
    FileHeaders: FileHeader[]
    Error: string,
}

function newMetadataResponse(FileHeaders: FileHeader[], err: string): MetadataResponse {
    return {
        FileHeaders: FileHeaders,
        Error: err
    }
}

class Extractor {
    v3String: string = "RPA-3.0";

    isV1(fileName: string): boolean {
        return fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase() === 'rpi'
    }

    isV2(length: number): boolean {
        return length === 2
    }

    isV3(v: string): boolean {
        return v === this.v3String
    }

    async parseHeader(filename: string, headerString: string): Promise<RPAHeader> {

        try {
            if (this.isV1(filename)) {
                console.log("The RPA-1.0 which has extension '.rpi' is not supported")
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }

            const firstLineEndIndex = headerString.indexOf('\n');
            if (firstLineEndIndex === -1) {
                console.log("Is it RPA format? The first 100 bytes do not contain a newline character.");
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }

            const firstLine = headerString.substring(0, firstLineEndIndex >= 0 ? firstLineEndIndex : headerString.length);
            const lines = firstLine.split('\n');
            const header = lines[0];
            const parts = header.split(' ');

            if (parts.length < 2 || parts.length > 4) {
                console.log("Is it RPA file? Number of header components doesn't match to any format")
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }

            if (this.isV2(parts.length)) {
                console.log("Looks like it's RPA-2.0 format which is not supported");
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }
            let offsetParse = this.stringToBigInt(parts[1]);
            let keyParse = this.stringToBigInt(parts[2]);
            if (!offsetParse[1] || !keyParse[1]) {
                console.log("Is it RPA file? The archive header has errors");
                return failedRPAHeader("Is it RPA file? The archive has errors")
            }

            const offsetNumber = offsetParse[0];
            const keyNumber = keyParse[0];

            if (!this.isV3(parts[0])) {
                console.log("Is it RPA file? It doesn't match to any RPA version");
                return failedRPAHeader("Is it RPA file? The archive has errors")
            } else {
                console.log("Detected version " + this.v3String)
            }

            return newRPAHeader(Number(offsetNumber), Number(keyNumber), "")

        } catch (error) {
            console.log("Error processing file " + error);
        }
        return failedRPAHeader("Is it RPA file? The archive has errors")
    }

    async parseMetadata(metadataSrc: Blob, keyNumber: number): Promise<MetadataResponse> {
        try {
            // Wrap FileReader operation in a Promise
            const metadataString: string = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (e: any): Promise<void> => {
                    try {
                        resolve(parseMetadata(new Uint8Array(e.target.result), keyNumber))
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.readAsArrayBuffer(metadataSrc);
            });
            return JSON.parse(metadataString)

        } catch (error) {
            console.log("Error processing file " + error);
            return {
                FileHeaders: [],
                Error: "Is it RPA file? The archive has errors"
            }
        }
    }

    async extractMetadata(file: File): Promise<MetadataResponse> {

        const chunkSize = 100; // we assume that RPA header must fit in 100 bytes
        const headerBlob: Blob = file.slice(0, chunkSize);

        let rpaHead: RPAHeader = await this.parseHeader(file.name, await headerBlob.text());
        if (rpaHead.Error !== "") {
            return newMetadataResponse([], rpaHead.Error);
        }
        const metadataBlob: Blob = file.slice(rpaHead.offsetNumber);
        return this.parseMetadata(metadataBlob, rpaHead.keyNumber);

    }

    isHexString(str: string) {
        const regex1 = /^0x[0-9a-fA-F]+$/i;
        const regex2 = /^[0-9a-fA-F]+$/i;
        return regex1.test(str) || regex2.test(str);
    }

    stringToBigInt(hexString: string): [number, boolean] {
        if (!this.isHexString(hexString)) {
            console.log(`"${hexString}" is not hex string`);
            return [0, false]
        }

        if (hexString.length % 2 !== 0) {
            console.error("Hex string must have an even length");
            return [0, false]
        }

        const n: number = Number(BigInt("0x" + hexString));

        return [n, true];
    }
}

export async function extractMetadata(file: File): Promise<MetadataResponse> {
    const e: Extractor = new Extractor()
    return e.extractMetadata(file)
}