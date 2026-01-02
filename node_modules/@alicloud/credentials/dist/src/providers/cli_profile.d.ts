import Credentials from '../credentials';
import CredentialsProvider from '../credentials_provider';
declare class CLIProfileCredentialsProviderBuilder {
    profileName: string;
    build(): CLIProfileCredentialsProvider;
    withProfileName(profileName: string): this;
}
interface Profile {
    name: string;
    mode: string;
    access_key_id: string;
    access_key_secret: string;
    sts_token: string;
    region_id: string;
    ram_role_arn: string;
    ram_session_name: string;
    expired_seconds: number;
    sts_region: string;
    source_profile: string;
    ram_role_name: string;
    oidc_token_file: string;
    oidc_provider_arn: string;
    sts_endpoint: string;
    enable_vpc: boolean;
    duration_seconds: number;
}
declare class Configuration {
    current: string;
    profiles: Profile[];
}
export declare function getConfiguration(cfgPath: string): Promise<Configuration>;
export declare function getProfile(conf: Configuration, profileName: string): Profile;
export default class CLIProfileCredentialsProvider implements CredentialsProvider {
    static builder(): CLIProfileCredentialsProviderBuilder;
    private readonly profileName;
    private innerProvider;
    private homedir;
    constructor(builder: CLIProfileCredentialsProviderBuilder);
    private getCredentialsProvider;
    getCredentials(): Promise<Credentials>;
    getProviderName(): string;
}
export {};
