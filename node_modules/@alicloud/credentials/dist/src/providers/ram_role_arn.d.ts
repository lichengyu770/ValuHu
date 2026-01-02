import CredentialsProvider from '../credentials_provider';
import { SessionCredentialProvider } from './session';
declare class RAMRoleARNCredentialsProviderBuilder {
    credentialsProvider: CredentialsProvider;
    roleArn: string;
    roleSessionName: string;
    durationSeconds: number;
    stsEndpoint: string;
    stsRegionId: string;
    policy: string;
    externalId: string;
    enableVpc?: boolean;
    readTimeout?: number;
    connectTimeout?: number;
    build(): RAMRoleARNCredentialsProvider;
    withCredentialsProvider(credentialsProvider: CredentialsProvider): RAMRoleARNCredentialsProviderBuilder;
    withRoleArn(roleArn: string): RAMRoleARNCredentialsProviderBuilder;
    withStsRegionId(regionId: string): RAMRoleARNCredentialsProviderBuilder;
    withStsEndpoint(endpoint: string): RAMRoleARNCredentialsProviderBuilder;
    withRoleSessionName(roleSessionName: string): RAMRoleARNCredentialsProviderBuilder;
    withPolicy(policy: string): RAMRoleARNCredentialsProviderBuilder;
    withExternalId(externalId: string): RAMRoleARNCredentialsProviderBuilder;
    withDurationSeconds(durationSeconds: number): RAMRoleARNCredentialsProviderBuilder;
    withEnableVpc(enableVpc: boolean): RAMRoleARNCredentialsProviderBuilder;
    withReadTimeout(readTimeout: number): RAMRoleARNCredentialsProviderBuilder;
    withConnectTimeout(connectTimeout: number): RAMRoleARNCredentialsProviderBuilder;
}
export default class RAMRoleARNCredentialsProvider extends SessionCredentialProvider implements CredentialsProvider {
    private readonly credentialsProvider;
    private readonly stsEndpoint;
    private readonly roleSessionName;
    private readonly policy;
    private readonly durationSeconds;
    private readonly externalId;
    private readonly roleArn;
    private readonly readTimeout;
    private readonly connectTimeout;
    private doRequest;
    private lastUpdateTimestamp;
    static builder(): RAMRoleARNCredentialsProviderBuilder;
    constructor(builder: RAMRoleARNCredentialsProviderBuilder);
    private getCredentialsInternal;
    getProviderName(): string;
}
export {};
