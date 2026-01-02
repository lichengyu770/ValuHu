import Credentials from '../credentials';
import CredentialsProvider from '../credentials_provider';
export default class DefaultCredentialsProvider implements CredentialsProvider {
    private readonly providers;
    private lastUsedProvider;
    static builder(): DefaultCredentialsProviderBuilder;
    constructor(builder: DefaultCredentialsProviderBuilder);
    getCredentials(): Promise<Credentials>;
    getProviderName(): string;
}
declare class DefaultCredentialsProviderBuilder {
    build(): DefaultCredentialsProvider;
}
export {};
