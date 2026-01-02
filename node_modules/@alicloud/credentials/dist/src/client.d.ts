import ICredential from './icredential';
import Config from './config';
import CredentialModel from './credential_model';
import CredentialsProvider from './credentials_provider';
import StaticAKCredentialsProvider from './providers/static_ak';
import StaticSTSCredentialsProvider from './providers/static_sts';
import RAMRoleARNCredentialsProvider from './providers/ram_role_arn';
import OIDCRoleArnCredentialsProvider from './providers/oidc_role_arn';
import ECSRAMRoleCredentialsProvider from './providers/ecs_ram_role';
import DefaultCredentialsProvider from './providers/default';
import URICredentialsProvider from './providers/uri';
import CLIProfileCredentialsProvider from './providers/cli_profile';
import ProfileCredentialsProvider from './providers/profile';
import EnvironmentVariableCredentialsProvider from './providers/env';
export { CredentialModel, Config, DefaultCredentialsProvider, CredentialsProvider, StaticAKCredentialsProvider, StaticSTSCredentialsProvider, RAMRoleARNCredentialsProvider, OIDCRoleArnCredentialsProvider, ECSRAMRoleCredentialsProvider, URICredentialsProvider, EnvironmentVariableCredentialsProvider, ProfileCredentialsProvider, CLIProfileCredentialsProvider };
export default class Credential implements ICredential {
    credential: ICredential;
    constructor(config?: Config | null, provider?: CredentialsProvider | {
        [key: string]: any;
    } | null);
    /**
     * @deprecated Use getCredential() instead of
     */
    getAccessKeyId(): Promise<string>;
    /**
     * @deprecated Use getCredential() instead of
     */
    getAccessKeySecret(): Promise<string>;
    /**
     * @deprecated Use getCredential() instead of
     */
    getSecurityToken(): Promise<string>;
    /**
     * @deprecated Use getCredential() instead of
     */
    getBearerToken(): string;
    /**
     * @deprecated Use getCredential() instead of
     */
    getType(): string;
    getCredential(): Promise<CredentialModel>;
    private load;
}
