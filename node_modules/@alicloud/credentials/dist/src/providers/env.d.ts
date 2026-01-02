import Credentials from '../credentials';
import CredentialsProvider from '../credentials_provider';
export default class EnvironmentVariableCredentialsProvider implements CredentialsProvider {
    static builder(): EnvironmentVariableCredentialsProviderBuilder;
    getCredentials(): Promise<Credentials>;
    getProviderName(): string;
    constructor(builder: EnvironmentVariableCredentialsProviderBuilder);
}
declare class EnvironmentVariableCredentialsProviderBuilder {
    build(): EnvironmentVariableCredentialsProvider;
}
export {};
