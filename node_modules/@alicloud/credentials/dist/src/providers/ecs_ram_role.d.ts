/// <reference types="node" />
import CredentialsProvider from '../credentials_provider';
import { SessionCredentialProvider } from './session';
export default class ECSRAMRoleCredentialsProvider extends SessionCredentialProvider implements CredentialsProvider {
    private readonly roleName;
    private readonly disableIMDSv1;
    private checker;
    private doRequest;
    private readonly readTimeout;
    private readonly connectTimeout;
    private shouldRefreshCred;
    static builder(): ECSRAMRoleCredentialsProviderBuilder;
    constructor(builder: ECSRAMRoleCredentialsProviderBuilder);
    checkCredentialsUpdateAsynchronously(): NodeJS.Timeout;
    close(): void;
    private getMetadataToken;
    private getRoleName;
    private getCredentialsInternal;
    getProviderName(): string;
}
declare class ECSRAMRoleCredentialsProviderBuilder {
    roleName: string;
    disableIMDSv1: boolean;
    readTimeout?: number;
    connectTimeout?: number;
    asyncCredentialUpdateEnabled?: boolean;
    constructor();
    withRoleName(roleName: string): ECSRAMRoleCredentialsProviderBuilder;
    withDisableIMDSv1(disableIMDSv1: boolean): ECSRAMRoleCredentialsProviderBuilder;
    withReadTimeout(readTimeout: number): ECSRAMRoleCredentialsProviderBuilder;
    withConnectTimeout(connectTimeout: number): ECSRAMRoleCredentialsProviderBuilder;
    withAsyncCredentialUpdateEnabled(asyncCredentialUpdateEnabled: boolean): ECSRAMRoleCredentialsProviderBuilder;
    build(): ECSRAMRoleCredentialsProvider;
}
export {};
