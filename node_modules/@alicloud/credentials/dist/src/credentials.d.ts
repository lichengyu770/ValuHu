export default class Credentials {
    readonly accessKeyId: string;
    readonly accessKeySecret: string;
    readonly securityToken: string;
    readonly providerName: string;
    constructor(builder: CredentialsBuilder);
    static builder(): CredentialsBuilder;
}
export declare class CredentialsBuilder {
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
    providerName: string;
    withAccessKeyId(value: string): this;
    withAccessKeySecret(value: string): this;
    withSecurityToken(value: string): this;
    withProviderName(value: string): this;
    build(): Credentials;
}
