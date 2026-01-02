/**
 * This is a string module
 */
/// <reference types="node" />
export default class Client {
    static split(raw: string, sep: string, limit: number): string[];
    static replace(raw: string, oldStr: string, newStr: string, count?: number): string;
    static contains(s: string, substr: string): boolean;
    static count(s: string, substr: string): number;
    static hasPrefix(s: string, prefix: string): boolean;
    static hasSuffix(s: string, substr: string): boolean;
    static index(s: string, substr: string): number;
    static toLower(s: string): string;
    static toUpper(s: string): string;
    static subString(s: string, strat: number, end: number): string;
    static equals(expect: string, actual: string): boolean;
    static trim(str: string): string;
    static toBytes(str: string, encoding: BufferEncoding): Buffer;
}
