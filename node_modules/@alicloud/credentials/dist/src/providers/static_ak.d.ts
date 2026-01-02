import Credentials from '../credentials';
import CredentialsProvider from '../credentials_provider';
/**
 * @internal
 */
export declare class StaticAKCredentialsProviderBuilder {
    accessKeyId: string;
    accessKeySecret: string;
    withAccessKeyId(accessKeyId: string): StaticAKCredentialsProviderBuilder;
    withAccessKeySecret(accessKeySecret: string): StaticAKCredentialsProviderBuilder;
    build(): StaticAKCredentialsProvider;
}
/**
 * @internal
 */
export default class StaticAKCredentialsProvider implements CredentialsProvider {
    static builder(): StaticAKCredentialsProviderBuilder;
    private readonly accessKeyId;
    private readonly accessKeySecret;
    constructor(builder: StaticAKCredentialsProviderBuilder);
    getProviderName(): string;
    getCredentials(): Promise<Credentials>;
}
