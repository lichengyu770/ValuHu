"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIProfileCredentialsProvider = exports.ProfileCredentialsProvider = exports.EnvironmentVariableCredentialsProvider = exports.URICredentialsProvider = exports.ECSRAMRoleCredentialsProvider = exports.OIDCRoleArnCredentialsProvider = exports.RAMRoleARNCredentialsProvider = exports.StaticSTSCredentialsProvider = exports.StaticAKCredentialsProvider = exports.DefaultCredentialsProvider = exports.Config = exports.CredentialModel = void 0;
const rsa_key_pair_credential_1 = __importDefault(require("./rsa_key_pair_credential"));
const bearer_token_credential_1 = __importDefault(require("./bearer_token_credential"));
const config_1 = __importDefault(require("./config"));
exports.Config = config_1.default;
const credential_model_1 = __importDefault(require("./credential_model"));
exports.CredentialModel = credential_model_1.default;
const static_ak_1 = __importDefault(require("./providers/static_ak"));
exports.StaticAKCredentialsProvider = static_ak_1.default;
const static_sts_1 = __importDefault(require("./providers/static_sts"));
exports.StaticSTSCredentialsProvider = static_sts_1.default;
const ram_role_arn_1 = __importDefault(require("./providers/ram_role_arn"));
exports.RAMRoleARNCredentialsProvider = ram_role_arn_1.default;
const oidc_role_arn_1 = __importDefault(require("./providers/oidc_role_arn"));
exports.OIDCRoleArnCredentialsProvider = oidc_role_arn_1.default;
const ecs_ram_role_1 = __importDefault(require("./providers/ecs_ram_role"));
exports.ECSRAMRoleCredentialsProvider = ecs_ram_role_1.default;
const default_1 = __importDefault(require("./providers/default"));
exports.DefaultCredentialsProvider = default_1.default;
const uri_1 = __importDefault(require("./providers/uri"));
exports.URICredentialsProvider = uri_1.default;
const cli_profile_1 = __importDefault(require("./providers/cli_profile"));
exports.CLIProfileCredentialsProvider = cli_profile_1.default;
const profile_1 = __importDefault(require("./providers/profile"));
exports.ProfileCredentialsProvider = profile_1.default;
const env_1 = __importDefault(require("./providers/env"));
exports.EnvironmentVariableCredentialsProvider = env_1.default;
class InnerCredentialsClient {
    constructor(type, provider) {
        this.type = type;
        this.provider = provider;
    }
    /**
     * @deprecated use getCredential() instead of
     * @returns the access key id of credentials
     */
    async getAccessKeyId() {
        const credentials = await this.provider.getCredentials();
        return credentials.accessKeyId;
    }
    /**
     * @deprecated use getCredential() instead of
     * @returns the access key secret of credentials
     */
    async getAccessKeySecret() {
        const credentials = await this.provider.getCredentials();
        return credentials.accessKeySecret;
    }
    /**
     * @deprecated use getCredential() instead of
     * @returns the security token of credentials
     */
    async getSecurityToken() {
        const credentials = await this.provider.getCredentials();
        return credentials.securityToken;
    }
    getBearerToken() {
        return;
    }
    getType() {
        return this.type;
    }
    async getCredential() {
        const credentials = await this.provider.getCredentials();
        return new credential_model_1.default({
            accessKeyId: credentials.accessKeyId,
            accessKeySecret: credentials.accessKeySecret,
            securityToken: credentials.securityToken,
            bearerToken: undefined,
            type: this.getType(),
            providerName: credentials.providerName,
        });
    }
}
function isCredentialsProviderClass(t) {
    if (!t) {
        return false;
    }
    return typeof t.getCredentials === 'function' && typeof t.getProviderName === 'function';
}
class Credential {
    constructor(config = null, provider = null) {
        if (isCredentialsProviderClass(provider)) {
            this.load(null, provider);
        }
        else {
            this.load(config, null);
        }
    }
    /**
     * @deprecated Use getCredential() instead of
     */
    getAccessKeyId() {
        return this.credential.getAccessKeyId();
    }
    /**
     * @deprecated Use getCredential() instead of
     */
    getAccessKeySecret() {
        return this.credential.getAccessKeySecret();
    }
    /**
     * @deprecated Use getCredential() instead of
     */
    getSecurityToken() {
        return this.credential.getSecurityToken();
    }
    /**
     * @deprecated Use getCredential() instead of
     */
    getBearerToken() {
        return this.credential.getBearerToken();
    }
    /**
     * @deprecated Use getCredential() instead of
     */
    getType() {
        return this.credential.getType();
    }
    getCredential() {
        return this.credential.getCredential();
    }
    load(config, provider) {
        if (provider) {
            this.credential = new InnerCredentialsClient(provider.getProviderName(), provider);
            return;
        }
        if (!config) {
            this.credential = new InnerCredentialsClient('default', default_1.default.builder().build());
            return;
        }
        if (!config.type) {
            throw new Error('Missing required type option');
        }
        switch (config.type) {
            case 'access_key':
                this.credential = new InnerCredentialsClient('access_key', static_ak_1.default.builder()
                    .withAccessKeyId(config.accessKeyId)
                    .withAccessKeySecret(config.accessKeySecret)
                    .build());
                break;
            case 'sts':
                this.credential = new InnerCredentialsClient('sts', static_sts_1.default.builder()
                    .withAccessKeyId(config.accessKeyId)
                    .withAccessKeySecret(config.accessKeySecret)
                    .withSecurityToken(config.securityToken)
                    .build());
                break;
            case 'ecs_ram_role':
                this.credential = new InnerCredentialsClient('ecs_ram_role', ecs_ram_role_1.default.builder()
                    .withRoleName(config.roleName)
                    .withDisableIMDSv1(config.disableIMDSv1)
                    .withAsyncCredentialUpdateEnabled(config.asyncCredentialUpdateEnabled)
                    .withReadTimeout(config.timeout)
                    .withConnectTimeout(config.connectTimeout)
                    .build());
                break;
            case 'ram_role_arn':
                {
                    let credentialsProvider;
                    if (config.securityToken) {
                        credentialsProvider = static_sts_1.default.builder()
                            .withAccessKeyId(config.accessKeyId)
                            .withAccessKeySecret(config.accessKeySecret)
                            .withSecurityToken(config.securityToken)
                            .build();
                    }
                    else {
                        credentialsProvider = static_ak_1.default.builder()
                            .withAccessKeyId(config.accessKeyId)
                            .withAccessKeySecret(config.accessKeySecret)
                            .build();
                    }
                    this.credential = new InnerCredentialsClient('ram_role_arn', ram_role_arn_1.default.builder()
                        .withCredentialsProvider(credentialsProvider)
                        .withRoleArn(config.roleArn)
                        .withPolicy(config.policy)
                        .withDurationSeconds(config.roleSessionExpiration)
                        .withRoleSessionName(config.roleSessionName)
                        .withReadTimeout(config.timeout)
                        .withConnectTimeout(config.connectTimeout)
                        .withEnableVpc(config.enableVpc)
                        .withStsEndpoint(config.stsEndpoint)
                        .withStsRegionId(config.stsRegionId)
                        .withExternalId(config.externalId)
                        // .withHttpOptions(runtime)
                        .build());
                }
                break;
            case 'oidc_role_arn':
                this.credential = new InnerCredentialsClient('oidc_role_arn', oidc_role_arn_1.default.builder()
                    .withRoleArn(config.roleArn)
                    .withOIDCProviderArn(config.oidcProviderArn)
                    .withOIDCTokenFilePath(config.oidcTokenFilePath)
                    .withRoleSessionName(config.roleSessionName)
                    .withPolicy(config.policy)
                    .withDurationSeconds(config.roleSessionExpiration)
                    .withStsEndpoint(config.stsEndpoint)
                    .withStsRegionId(config.stsRegionId)
                    .withEnableVpc(config.enableVpc)
                    .withReadTimeout(config.timeout)
                    .withConnectTimeout(config.connectTimeout)
                    .build());
                break;
            case 'rsa_key_pair':
                this.credential = new rsa_key_pair_credential_1.default(config.publicKeyId, config.privateKeyFile);
                break;
            case 'bearer':
                this.credential = new bearer_token_credential_1.default(config.bearerToken);
                break;
            case 'credentials_uri':
                this.credential = new InnerCredentialsClient('credentials_uri', uri_1.default.builder()
                    .withCredentialsURI(config.credentialsURI)
                    .withReadTimeout(config.timeout)
                    .withConnectTimeout(config.connectTimeout)
                    .build());
                break;
            default:
                throw new Error('Invalid type option, support: access_key, sts, ecs_ram_role, ram_role_arn, rsa_key_pair, credentials_uri');
        }
    }
}
exports.default = Credential;
//# sourceMappingURL=client.js.map