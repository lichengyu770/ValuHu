import Credentials from '../credentials';
import CredentialsProvider from '../credentials_provider';
export default class ProfileCredentialsProvider implements CredentialsProvider {
    private readonly profileName;
    private innerProvider;
    private readonly homedir;
    getCredentials(): Promise<Credentials>;
    getCredentialsProvider(ini: any): CredentialsProvider;
    getProviderName(): string;
    static builder(): ProfileCredentialsProviderBuilder;
    constructor(builder: ProfileCredentialsProviderBuilder);
}
declare class ProfileCredentialsProviderBuilder {
    profileName: string;
    withProfileName(profileName: string): this;
    build(): ProfileCredentialsProvider;
}
export {};
