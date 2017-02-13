/// <reference types="node" />
import * as stream from 'stream';
export interface WritableStreamBufferOptions extends stream.WritableOptions {
    initialSize?: number;
    incrementAmount?: number;
}
export declare class WritableStreamBuffer extends stream.Writable {
    constructor(options?: WritableStreamBufferOptions);
    size(): number;
    maxSize(): number;
    getContents(length?: number): any | false;
    getContentsAsString(encoding?: string, length?: number): string;
}
export interface ReadableStreamBufferOptions extends stream.ReadableOptions {
    frequency?: number;
    chunkSize?: number;
    initialSize?: number;
    incrementAmount?: number;
}
export declare class ReadableStreamBuffer extends stream.Readable {
    constructor(options?: ReadableStreamBufferOptions);
    stop(): void;
    size(): number;
    maxSize(): number;
}
