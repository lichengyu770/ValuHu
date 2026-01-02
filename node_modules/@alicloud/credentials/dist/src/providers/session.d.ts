import CredentialsProvider from '../credentials_provider';
import Credentials from '../credentials';
export declare const STALE_TIME: number;
export declare class Session {
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
    expiration: string;
    constructor(accessKeyId: string, accessKeySecret: string, securityToken: string, expiration: string);
}
export declare type SessionRefresher = () => Promise<Session>;
export declare class SessionCredentialProvider implements CredentialsProvider {
    private expirationTimestamp;
    private session;
    private refreshFaliure;
    private readonly staleTime;
    private readonly prefetchTime;
    private staleTimestamp;
    private prefetchTimestamp;
    refresher: SessionRefresher;
    constructor(staleTime?: number, prefetchTime?: number);
    getCredentials(): Promise<Credentials>;
    refreshTimestamp(): void;
    maxStaleFailureJitter(): number;
    jitterTime(time: number, jitterStart: number, jitterEnd: number): number;
    refreshSession(): Promise<void>;
    getSession(): Promise<Session>;
    needUpdateCredential(): boolean;
    shouldPrefetchCredential(): boolean;
    getProviderName(): string;
}
