import SessionCredential from './session_credential';
import ICredential from './icredential';
export default class EcsRamRoleCredential extends SessionCredential implements ICredential {
    roleName: string;
    enableIMDSv2: boolean;
    metadataTokenDuration?: number;
    runtime: {
        [key: string]: any;
    };
    metadataToken?: string;
    staleTime?: number;
    readTimeout?: number;
    connectTimeout?: number;
    constructor(roleName?: string, runtime?: {
        [key: string]: any;
    }, enableIMDSv2?: boolean, metadataTokenDuration?: number);
    getBody(url: string, options?: {
        [key: string]: any;
    }): Promise<string>;
    getMetadataToken(): Promise<string>;
    updateCredential(): Promise<void>;
    getRoleName(): Promise<string>;
    needToRefresh(): boolean;
}
