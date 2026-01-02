import SessionCredential from './session_credential';
import Config from './config';
export default class OidcRoleArnCredential extends SessionCredential {
    roleArn: string;
    oidcProviderArn: string;
    oidcTokenFilePath: string;
    policy: string;
    durationSeconds: number;
    roleSessionName: string;
    runtime: {
        [key: string]: any;
    };
    host: string;
    constructor(config: Config, runtime?: {
        [key: string]: any;
    });
    private getOdicToken;
    updateCredential(): Promise<void>;
}
