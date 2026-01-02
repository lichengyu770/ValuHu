import { AlibabaCloudError } from "./AlibabaCloudError";
export declare class ClientError extends AlibabaCloudError {
    accessDeniedDetail?: {
        [key: string]: any;
    };
    constructor(map?: {
        [key: string]: any;
    });
}
