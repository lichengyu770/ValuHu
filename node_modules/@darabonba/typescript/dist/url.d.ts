/// <reference types="node" />
import * as url from 'url';
export default class TeaURL {
    _url: url.URL;
    constructor(str: string);
    path(): string;
    pathname(): string;
    protocol(): string;
    hostname(): string;
    host(): string;
    port(): string;
    hash(): string;
    search(): string;
    href(): string;
    auth(): string;
    static parse(url: string): TeaURL;
    static urlEncode(url: string): string;
    static percentEncode(raw: string): string;
    static pathEncode(path: string): string;
}
