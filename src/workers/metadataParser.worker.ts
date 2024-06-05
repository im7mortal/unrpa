import * as workerpool from 'workerpool';

import {extractMetadata as em} from "../unrpaLib/unrpaLib";

workerpool.worker({
    extractMetadata: em
});
export {};
