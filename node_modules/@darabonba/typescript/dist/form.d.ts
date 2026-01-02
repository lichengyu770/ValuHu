/// <reference types="node" />
import { Readable } from 'stream';
export declare class FileFormStream extends Readable {
    form: {
        [key: string]: any;
    };
    boundary: string;
    keys: string[];
    index: number;
    streaming: boolean;
    constructor(form: {
        [key: string]: any;
    }, boundary: string);
    _read(): void;
}
export default class Form {
    static getBoundary(): string;
    static toFileForm(form: {
        [key: string]: any;
    }, boundary: string): Readable;
    static toFormString(data: {
        [key: string]: any;
    }): string;
}
