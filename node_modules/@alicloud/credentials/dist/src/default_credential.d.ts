import Config from './config';
import CredentialModel from './credential_model';
import ICredential from './icredential';
export default class DefaultCredential implements ICredential {
    accessKeyId: string;
    accessKeySecret: string;
    securityToken?: string;
    bearerToken?: string;
    type: string;
    constructor(config: Config);
    getAccessKeyId(): Promise<string>;
    getAccessKeySecret(): Promise<string>;
    getSecurityToken(): Promise<string>;
    getBearerToken(): string;
    getType(): string;
    getCredential(): Promise<CredentialModel>;
}
