/// <reference types="node" />
/// <reference types="node" />
export declare class Request {
    readonly queries: {
        [key: string]: string;
    };
    readonly headers: {
        [key: string]: string;
    };
    readonly method: string;
    readonly protocol: any;
    readonly host: any;
    readonly path: any;
    readonly bodyForm: {
        [key: string]: string;
    };
    readonly bodyBytes: Buffer;
    readonly url: string;
    readonly readTimeout: number;
    readonly connectTimeout: number;
    static builder(): RequestBuilder;
    constructor(builder: RequestBuilder);
    toRequestURL(): string;
}
export declare class RequestBuilder {
    method: string;
    protocol: string;
    host: string;
    path: string;
    queries: {
        [key: string]: string;
    };
    headers: {
        [key: string]: string;
    };
    bodyForm: {
        [key: string]: string;
    };
    bodyBytes: Buffer;
    readTimeout: number;
    connectTimeout: number;
    url: string;
    build(): Request;
    withMethod(method: string): this;
    withProtocol(protocol: string): this;
    withHost(host: string): this;
    withPath(path: string): this;
    withQueries(queries: {
        [key: string]: string;
    }): this;
    withHeaders(headers: {
        [key: string]: string;
    }): this;
    withBodyForm(bodyForm: {
        [key: string]: string;
    }): this;
    withURL(url: string): this;
    withReadTimeout(readTimeout: number): this;
    withConnectTimeout(connectTimeout: number): this;
}
export declare class Response {
    readonly statusCode: number;
    readonly body: Buffer;
    readonly headers: {
        [key: string]: string;
    };
    static builder(): ResponseBuilder;
    constructor(builder: ResponseBuilder);
}
declare class ResponseBuilder {
    statusCode: number;
    headers: {
        [key: string]: string;
    };
    body: Buffer;
    withStatusCode(statusCode: number): this;
    withHeaders(headers: {
        [key: string]: string;
    }): this;
    withBody(body: Buffer): this;
    constructor();
    build(): Response;
}
export declare function doRequest(req: Request): Promise<Response>;
export {};
