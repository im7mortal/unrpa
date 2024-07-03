import {FileHeader} from "./unrpaLibTypes";
import {inflate} from "pako";
import {Parser} from "pickleparser";
import {MetadataResponse} from "./unrpaLib";
import JSBI from 'jsbi';
interface RPAHeader {
    offsetNumber: number,
    keyNumber: number
    Error: string,
}

interface PickleEntrance {
    [key: string]: Array<[number, number, string]>;
}

function xorBigInt(a: JSBI, b: JSBI): number {
    const result = JSBI.bitwiseXor(a, b);
    return Number(JSBI.toNumber(result));
}

function transformFontData(input: PickleEntrance, keyNumber: number): MetadataResponse {
    const fileHeaders: FileHeader[] = [];
    const keyBig: JSBI = JSBI.BigInt(keyNumber)

    for (const [key, values] of Object.entries(input)) {
        for (const [offset, len, field] of values) {
            let transformedOffset = offset;
            let transformedLen = len;
            if (keyNumber != 0) {
                transformedOffset = xorBigInt(JSBI.BigInt(offset), keyBig);
                transformedLen = xorBigInt(JSBI.BigInt(len), keyBig);
            }
            fileHeaders.push({
                Name: key,
                Offset: transformedOffset,
                Len: transformedLen,
                Field: field,
            });
        }
    }

    return {
        Error: "",
        FileHeaders: fileHeaders,
    };
}


export async function parseMetadata(input: Uint8Array, keyNumber: number): Promise<string> {
    const decompressedBuffer = inflate(input);
    const parser = new Parser();
    const obj: PickleEntrance = parser.parse(decompressedBuffer);
    const json = JSON.stringify(obj, null, 4);
    return JSON.stringify(transformFontData(obj, keyNumber)); //TODO just for development
}
