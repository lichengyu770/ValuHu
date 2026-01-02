import * as $tea from '@alicloud/tea-typescript';
export default class CredentialModel extends $tea.Model {
    accessKeyId?: string;
    accessKeySecret?: string;
    securityToken?: string;
    bearerToken?: string;
    type?: string;
    providerName?: string;
    static names(): {
        [key: string]: string;
    };
    static types(): {
        [key: string]: any;
    };
    constructor(map?: {
        [key: string]: any;
    });
}
