import sizeof from 'object-sizeof'

import { Options } from "../../options";

export class HttpBodyHandler {
    private maxPayloadSize: number; // The size in bytes of the maximum payload capturing
    private currentBodySize: number; // The size in bytes of the current stream capture size
    private contentEncoding: string; // The type of the Payload data
    private totalChunks: any[];

    constructor(options: Options, contentEncoding: string) {
        this.maxPayloadSize = options.maxPayloadSize;
        this.currentBodySize = 0;
        this.contentEncoding = contentEncoding;
        this.totalData = string;
    };

    addChunk(chunk: any) {
        if (!chunk) {
            return;
        }
        let chunkSize = sizeof(chunk);
    };
}
