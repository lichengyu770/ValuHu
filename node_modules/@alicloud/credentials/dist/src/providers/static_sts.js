"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticSTSCredentialsProviderBuilder = void 0;
const credentials_1 = __importDefault(require("../credentials"));
/**
 * @internal
 */
class StaticSTSCredentialsProviderBuilder {
    withAccessKeyId(accessKeyId) {
        this.accessKeyId = accessKeyId;
        return this;
    }
    withAccessKeySecret(accessKeySecret) {
        this.accessKeySecret = accessKeySecret;
        return this;
    }
    withSecurityToken(securityToken) {
        this.securityToken = securityToken;
        return this;
    }
    build() {
        if (!this.accessKeyId) {
            this.accessKeyId = process.env['ALIBABA_CLOUD_ACCESS_KEY_ID'];
        }
        if (!this.accessKeyId) {
            throw new Error('the access key id is empty');
        }
        if (!this.accessKeySecret) {
            this.accessKeySecret = process.env['ALIBABA_CLOUD_ACCESS_KEY_SECRET'];
        }
        if (!this.accessKeySecret) {
            throw new Error('the access key secret is empty');
        }
        if (!this.securityToken) {
            this.securityToken = process.env['ALIBABA_CLOUD_SECURITY_TOKEN'];
        }
        if (!this.securityToken) {
            throw new Error('the security token is empty');
        }
        return new StaticSTSCredentialsProvider(this);
    }
}
exports.StaticSTSCredentialsProviderBuilder = StaticSTSCredentialsProviderBuilder;
/**
 * @internal
 */
class StaticSTSCredentialsProvider {
    static builder() {
        return new StaticSTSCredentialsProviderBuilder();
    }
    constructor(builder) {
        this.accessKeyId = builder.accessKeyId;
        this.accessKeySecret = builder.accessKeySecret;
        this.securityToken = builder.securityToken;
    }
    getProviderName() {
        return 'static_sts';
    }
    async getCredentials() {
        return credentials_1.default.builder()
            .withAccessKeyId(this.accessKeyId)
            .withAccessKeySecret(this.accessKeySecret)
            .withSecurityToken(this.securityToken)
            .withProviderName(this.getProviderName())
            .build();
    }
}
exports.default = StaticSTSCredentialsProvider;
//# sourceMappingURL=static_sts.js.map