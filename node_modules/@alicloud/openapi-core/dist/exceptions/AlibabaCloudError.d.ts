import * as $dara from '@darabonba/typescript';
export declare class AlibabaCloudError extends $dara.ResponseError {
    statusCode?: number;
    code: string;
    message: string;
    description?: string;
    requestId?: string;
    constructor(map?: {
        [key: string]: any;
    });
}
