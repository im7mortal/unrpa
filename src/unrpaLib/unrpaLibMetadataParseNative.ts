import {FileHeader} from "./unrpaLibTypes";
import {inflate} from "pako";
import {Parser} from "pickleparser";
import {MetadataResponse} from "./unrpaLib";

interface RPAHeader {
    offsetNumber: number,
    keyNumber: number
    Error: string,
}

interface PickleEntrance {
    [key: string]: Array<[number, number, string]>;
}


function transformFontData(input: PickleEntrance, keyNumber: number): MetadataResponse {
    const fileHeaders: FileHeader[] = [];

    for (const [key, values] of Object.entries(input)) {
        for (const [offset, len, field] of values) {
            let transformedOffset = offset;
            let transformedLen = len;
            if (keyNumber != 0) {
                transformedOffset = offset ^ keyNumber;
                transformedLen = len ^ keyNumber;
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
