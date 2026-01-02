import CredentialsProvider from '../credentials_provider';
import { SessionCredentialProvider } from './session';
/**
 * @internal
 */
export default class URICredentialsProvider extends SessionCredentialProvider implements CredentialsProvider {
    static builder(): URICredentialsProviderBuilder;
    private readonly credentialsURI;
    private doRequest;
    private readonly readTimeout;
    private readonly connectTimeout;
    constructor(builder: URICredentialsProviderBuilder);
    getProviderName(): string;
    private getCredentialsUri;
}
/**
 * @internal
 */
export declare class URICredentialsProviderBuilder {
    credentialsURI: string;
    readTimeout?: number;
    connectTimeout?: number;
    withCredentialsURI(credentialsURI: string): URICredentialsProviderBuilder;
    withReadTimeout(readTimeout: number): URICredentialsProviderBuilder;
    withConnectTimeout(connectTimeout: number): URICredentialsProviderBuilder;
    build(): URICredentialsProvider;
}
