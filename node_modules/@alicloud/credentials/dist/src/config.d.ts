import * as $tea from '@alicloud/tea-typescript';
export default class Config extends $tea.Model {
    accessKeyId?: string;
    accessKeySecret?: string;
    securityToken?: string;
    bearerToken?: string;
    durationSeconds?: number;
    roleArn?: string;
    policy?: string;
    roleSessionExpiration?: number;
    roleSessionName?: string;
    publicKeyId?: string;
    privateKeyFile?: string;
    roleName?: string;
    enableIMDSv2?: boolean;
    disableIMDSv1: boolean;
    asyncCredentialUpdateEnabled: boolean;
    metadataTokenDuration?: number;
    credentialsURI?: string;
    oidcProviderArn: string;
    oidcTokenFilePath: string;
    type?: string;
    externalId?: string;
    stsEndpoint?: string;
    timeout?: number;
    connectTimeout?: number;
    static names(): {
        [key: string]: string;
    };
    static types(): {
        [key: string]: any;
    };
    constructor(config?: {
        [key: string]: any;
    });
}
