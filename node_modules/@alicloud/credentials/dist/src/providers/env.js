"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const credentials_1 = __importDefault(require("../credentials"));
class EnvironmentVariableCredentialsProvider {
    static builder() {
        return new EnvironmentVariableCredentialsProviderBuilder();
    }
    async getCredentials() {
        const accessKeyId = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
        if (!accessKeyId) {
            throw new Error('unable to get credentials from enviroment variables, Access key ID must be specified via environment variable (ALIBABA_CLOUD_ACCESS_KEY_ID)');
        }
        const accessKeySecret = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
        if (!accessKeySecret) {
            throw new Error('unable to get credentials from enviroment variables, Access key secret must be specified via environment variable (ALIBABA_CLOUD_ACCESS_KEY_SECRET)');
        }
        const securityToken = process.env.ALIBABA_CLOUD_SECURITY_TOKEN;
        return credentials_1.default.builder()
            .withAccessKeyId(accessKeyId)
            .withAccessKeySecret(accessKeySecret)
            .withSecurityToken(securityToken)
            .withProviderName(this.getProviderName())
            .build();
    }
    getProviderName() {
        return 'env';
    }
    constructor(builder) {
    }
}
exports.default = EnvironmentVariableCredentialsProvider;
class EnvironmentVariableCredentialsProviderBuilder {
    build() {
        return new EnvironmentVariableCredentialsProvider(this);
    }
}
//# sourceMappingURL=env.js.map