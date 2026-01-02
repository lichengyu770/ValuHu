import * as $dara from '@darabonba/typescript';
/**
 * @remarks
 * This is for OpenApi SDK
 */
export declare class SSEResponse extends $dara.Model {
    headers: {
        [key: string]: string;
    };
    /**
     * @remarks
     * HTTP Status Code
     */
    statusCode: number;
    event: $dara.SSEEvent;
    static names(): {
        [key: string]: string;
    };
    static types(): {
        [key: string]: any;
    };
    validate(): void;
    constructor(map?: {
        [key: string]: any;
    });
}
