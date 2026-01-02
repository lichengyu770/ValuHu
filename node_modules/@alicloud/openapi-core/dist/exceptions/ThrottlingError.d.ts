import { AlibabaCloudError } from "./AlibabaCloudError";
export declare class ThrottlingError extends AlibabaCloudError {
    retryAfter?: number;
    constructor(map?: {
        [key: string]: any;
    });
}
