/// <reference types="node" />
import { Readable } from 'stream';
import * as $tea from '@alicloud/tea-typescript';
export { ExtendsParameters, RuntimeOptions } from '@darabonba/typescript';
export default class Client {
    static toString(buff: Buffer): string;
    static parseJSON(text: string): any;
    static readAsBytes(stream: Readable): Promise<Buffer>;
    static readAsString(stream: Readable): Promise<string>;
    static readAsJSON(stream: Readable): Promise<any>;
    static getNonce(): string;
    static getDateUTCString(): string;
    static defaultString(real: string, defaultValue: string): string;
    static defaultNumber(real: number, defaultValue: number): number;
    static toFormString(val: {
        [key: string]: any;
    }): string;
    static toJSONString(val: any): string;
    static toBytes(val: string): Buffer;
    static empty(val: string): boolean;
    static equalString(val1: string, val2: string): boolean;
    static equalNumber(val1: number, val2: number): boolean;
    static isUnset(value: any): boolean;
    static stringifyMapValue(m: {
        [key: string]: any;
    }): {
        [key: string]: string;
    };
    static anyifyMapValue(m: {
        [key: string]: string;
    }): {
        [key: string]: any;
    };
    static assertAsBoolean(value: any): boolean;
    static assertAsString(value: any): string;
    static assertAsNumber(value: any): number;
    /**
     * Assert a value, if it is a integer, return it, otherwise throws
     * @return the integer value
     */
    static assertAsInteger(value: any): number;
    static assertAsMap(value: any): {
        [key: string]: any;
    };
    static assertAsArray(value: any): any[];
    static assertAsBytes(value: any): Buffer;
    static getUserAgent(userAgent: string): string;
    static is2xx(code: number): boolean;
    static is3xx(code: number): boolean;
    static is4xx(code: number): boolean;
    static is5xx(code: number): boolean;
    static validateModel(m: $tea.Model): void;
    static toMap(inputModel: $tea.Model): {
        [key: string]: any;
    };
    static sleep(millisecond: number): Promise<void>;
    static toArray(input: any): {
        [key: string]: any;
    }[];
    /**
     * Assert a value, if it is a readable, return it, otherwise throws
     * @return the readable value
     */
    static assertAsReadable(value: any): Readable;
    /**
     * Get hostname of current machine
     * @return the string value
     */
    static getHostName(): string;
}
