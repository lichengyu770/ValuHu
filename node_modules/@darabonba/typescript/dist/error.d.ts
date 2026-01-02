import { Request, Response } from './core';
import { RetryPolicyContext } from './retry';
export declare class BaseError extends Error {
    name: string;
    code: string;
    constructor(map: {
        [key: string]: any;
    });
}
export declare class ResponseError extends BaseError {
    code: string;
    statusCode?: number;
    retryAfter?: number;
    data?: any;
    description?: string;
    accessDeniedDetail?: any;
    constructor(map: any);
}
export declare function retryError(request: Request, response: Response): Error;
export declare function newError(data: any): ResponseError;
export declare function newUnretryableError(ctx: RetryPolicyContext | Request): Error;
