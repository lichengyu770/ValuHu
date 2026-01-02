import CredentialsProvider from '../credentials_provider';
import { Session, SessionCredentialProvider } from './session';
declare class OIDCRoleArnCredentialsProviderBuilder {
    oidcProviderArn: any;
    oidcTokenFilePath: any;
    roleArn: any;
    roleSessionName: string;
    stsEndpoint: string;
    stsRegionId: string;
    policy: string;
    durationSeconds: number;
    enableVpc?: boolean;
    readTimeout?: number;
    connectTimeout?: number;
    withOIDCProviderArn(oidcProviderArn: string): this;
    withOIDCTokenFilePath(path: string): this;
    withRoleArn(roleArn: string): this;
    withRoleSessionName(roleSessionName: string): this;
    withDurationSeconds(durationSeconds: number): this;
    withStsEndpoint(stsEndpoint: string): this;
    withStsRegionId(regionId: string): this;
    withPolicy(policy: string): this;
    withEnableVpc(enableVpc: boolean): OIDCRoleArnCredentialsProviderBuilder;
    withReadTimeout(readTimeout: number): OIDCRoleArnCredentialsProviderBuilder;
    withConnectTimeout(connectTimeout: number): OIDCRoleArnCredentialsProviderBuilder;
    build(): OIDCRoleArnCredentialsProvider;
}
export default class OIDCRoleArnCredentialsProvider extends SessionCredentialProvider implements CredentialsProvider {
    private readonly roleArn;
    private readonly oidcProviderArn;
    private readonly oidcTokenFilePath;
    private readonly policy;
    private readonly durationSeconds;
    private readonly roleSessionName;
    runtime: {
        [key: string]: any;
    };
    private readonly stsEndpoint;
    private doRequest;
    private readonly readTimeout;
    private readonly connectTimeout;
    lastUpdateTimestamp: number;
    static builder(): OIDCRoleArnCredentialsProviderBuilder;
    constructor(builder: OIDCRoleArnCredentialsProviderBuilder);
    getProviderName(): string;
    getCredentialsInternal(): Promise<Session>;
}
export {};
