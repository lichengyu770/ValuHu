import Credentials from '../credentials';
import CredentialsProvider from '../credentials_provider';
/**
 * @internal
 */
export declare class StaticSTSCredentialsProviderBuilder {
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
    withAccessKeyId(accessKeyId: string): StaticSTSCredentialsProviderBuilder;
    withAccessKeySecret(accessKeySecret: string): StaticSTSCredentialsProviderBuilder;
    withSecurityToken(securityToken: string): StaticSTSCredentialsProviderBuilder;
    build(): StaticSTSCredentialsProvider;
}
/**
 * @internal
 */
export default class StaticSTSCredentialsProvider implements CredentialsProvider {
    static builder(): StaticSTSCredentialsProviderBuilder;
    private readonly accessKeyId;
    private readonly accessKeySecret;
    private readonly securityToken;
    constructor(builder: StaticSTSCredentialsProviderBuilder);
    getProviderName(): string;
    getCredentials(): Promise<Credentials>;
}
