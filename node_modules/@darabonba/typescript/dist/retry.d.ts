import * as $core from './core';
import * as $error from './error';
export declare class BackoffPolicy {
    policy: string;
    constructor(option: {
        [key: string]: any;
    });
    getDelayTime(ctx: RetryPolicyContext): number;
    static newBackoffPolicy(option: {
        [key: string]: any;
    }): BackoffPolicy;
}
export declare class RetryCondition {
    maxAttempts: number;
    backoff: BackoffPolicy;
    exception: string[];
    errorCode: string[];
    maxDelay: number;
    constructor(condition: {
        [key: string]: any;
    });
}
export declare class RetryOptions {
    retryable: boolean;
    retryCondition: RetryCondition[];
    noRetryCondition: RetryCondition[];
    constructor(options: {
        [key: string]: any;
    });
}
export declare class RetryPolicyContext {
    key: string;
    retriesAttempted: number;
    httpRequest: $core.Request;
    httpResponse: $core.Response;
    exception: $error.ResponseError | $error.BaseError;
    constructor(options: {
        [key: string]: any;
    });
}
export declare function shouldRetry(options: RetryOptions, ctx: RetryPolicyContext): boolean;
export declare function getBackoffDelay(options: RetryOptions, ctx: RetryPolicyContext): number;
