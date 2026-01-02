"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URICredentialsProviderBuilder = void 0;
const session_1 = require("./session");
const http_1 = require("./http");
/**
 * @internal
 */
class URICredentialsProvider extends session_1.SessionCredentialProvider {
    static builder() {
        return new URICredentialsProviderBuilder();
    }
    constructor(builder) {
        super(session_1.STALE_TIME);
        this.doRequest = http_1.doRequest;
        this.refresher = this.getCredentialsUri;
        this.credentialsURI = builder.credentialsURI;
        this.readTimeout = builder.readTimeout;
        this.connectTimeout = builder.connectTimeout;
    }
    getProviderName() {
        return 'credential_uri';
    }
    async getCredentialsUri() {
        const builder = http_1.Request.builder()
            .withMethod('GET')
            .withURL(this.credentialsURI)
            .withReadTimeout(this.readTimeout || 10000)
            .withConnectTimeout(this.connectTimeout || 5000);
        const request = builder.build();
        const response = await this.doRequest(request);
        if (response.statusCode !== 200) {
            throw new Error(`get sts token failed, httpStatus: ${response.statusCode}, message = ${response.body.toString('utf8')}.`);
        }
        let data;
        try {
            data = JSON.parse(response.body.toString('utf8'));
        }
        catch (ex) {
            throw new Error(`get sts token failed, json parse failed: ${ex.message}, result: ${response.body.toString('utf8')}.`);
        }
        if (!data || !data.AccessKeyId || !data.AccessKeySecret || !data.SecurityToken) {
            throw new Error(`error retrieving credentials from credentialsURI result: ${JSON.stringify(data)}.`);
        }
        return new session_1.Session(data.AccessKeyId, data.AccessKeySecret, data.SecurityToken, data.Expiration);
    }
}
exports.default = URICredentialsProvider;
/**
 * @internal
 */
class URICredentialsProviderBuilder {
    withCredentialsURI(credentialsURI) {
        this.credentialsURI = credentialsURI;
        return this;
    }
    withReadTimeout(readTimeout) {
        this.readTimeout = readTimeout;
        return this;
    }
    withConnectTimeout(connectTimeout) {
        this.connectTimeout = connectTimeout;
        return this;
    }
    build() {
        if (!this.credentialsURI) {
            this.credentialsURI = process.env.ALIBABA_CLOUD_CREDENTIALS_URI;
        }
        return new URICredentialsProvider(this);
    }
}
exports.URICredentialsProviderBuilder = URICredentialsProviderBuilder;
//# sourceMappingURL=uri.js.map