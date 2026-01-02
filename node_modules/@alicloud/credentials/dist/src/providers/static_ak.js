"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticAKCredentialsProviderBuilder = void 0;
const credentials_1 = __importDefault(require("../credentials"));
/**
 * @internal
 */
class StaticAKCredentialsProviderBuilder {
    withAccessKeyId(accessKeyId) {
        this.accessKeyId = accessKeyId;
        return this;
    }
    withAccessKeySecret(accessKeySecret) {
        this.accessKeySecret = accessKeySecret;
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
        return new StaticAKCredentialsProvider(this);
    }
}
exports.StaticAKCredentialsProviderBuilder = StaticAKCredentialsProviderBuilder;
/**
 * @internal
 */
class StaticAKCredentialsProvider {
    static builder() {
        return new StaticAKCredentialsProviderBuilder();
    }
    constructor(builder) {
        this.accessKeyId = builder.accessKeyId;
        this.accessKeySecret = builder.accessKeySecret;
    }
    getProviderName() {
        return 'static_ak';
    }
    async getCredentials() {
        const credentials = credentials_1.default
            .builder()
            .withAccessKeyId(this.accessKeyId).withAccessKeySecret(this.accessKeySecret)
            .withProviderName('static_ak')
            .build();
        return credentials;
    }
}
exports.default = StaticAKCredentialsProvider;
//# sourceMappingURL=static_ak.js.map