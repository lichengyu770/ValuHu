"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const credentials_1 = __importDefault(require("../credentials"));
const cli_profile_1 = __importDefault(require("./cli_profile"));
const ecs_ram_role_1 = __importDefault(require("./ecs_ram_role"));
const env_1 = __importDefault(require("./env"));
const oidc_role_arn_1 = __importDefault(require("./oidc_role_arn"));
const uri_1 = __importDefault(require("./uri"));
const profile_1 = __importDefault(require("./profile"));
class DefaultCredentialsProvider {
    static builder() {
        return new DefaultCredentialsProviderBuilder();
    }
    constructor(builder) {
        this.providers = [];
        // Add static ak or sts credentials provider from env
        try {
            const envProvider = env_1.default.builder().build();
            this.providers.push(envProvider);
        }
        catch (ex) {
            // ignore
        }
        // oidc check
        try {
            const oidcProvider = oidc_role_arn_1.default.builder().build();
            this.providers.push(oidcProvider);
        }
        catch (ex) {
            // ignore
        }
        // cli credentials provider
        try {
            const cliProfileProvider = cli_profile_1.default.builder().build();
            this.providers.push(cliProfileProvider);
        }
        catch (ex) {
            // ignore
        }
        // profile credentials provider
        try {
            const profileProvider = profile_1.default.builder().build();
            this.providers.push(profileProvider);
        }
        catch (ex) {
            // ignore
        }
        // Add IMDS
        try {
            const ecsRamRoleProvider = ecs_ram_role_1.default.builder().withRoleName(process.env.ALIBABA_CLOUD_ECS_METADATA).build();
            this.providers.push(ecsRamRoleProvider);
        }
        catch (ex) {
            // ignore
        }
        // credentials uri
        try {
            const uriProvider = uri_1.default.builder().withCredentialsURI(process.env.ALIBABA_CLOUD_CREDENTIALS_URI).build();
            this.providers.push(uriProvider);
        }
        catch (ex) {
            // ignore
        }
    }
    async getCredentials() {
        if (this.lastUsedProvider) {
            const inner = await this.lastUsedProvider.getCredentials();
            return credentials_1.default.builder()
                .withAccessKeyId(inner.accessKeyId)
                .withAccessKeySecret(inner.accessKeySecret)
                .withSecurityToken(inner.securityToken)
                .withProviderName(`${this.getProviderName()}/${this.lastUsedProvider.getProviderName()}`)
                .build();
        }
        const errors = [];
        for (const provider of this.providers) {
            this.lastUsedProvider = provider;
            let inner;
            try {
                inner = await provider.getCredentials();
            }
            catch (ex) {
                errors.push(ex);
                continue;
            }
            if (inner) {
                return credentials_1.default.builder()
                    .withAccessKeyId(inner.accessKeyId)
                    .withAccessKeySecret(inner.accessKeySecret)
                    .withSecurityToken(inner.securityToken)
                    .withProviderName(`${this.getProviderName()}/${this.lastUsedProvider.getProviderName()}`)
                    .build();
            }
        }
        throw new Error(`unable to get credentials from any of the providers in the chain: ${errors.map((e) => {
            return e.message;
        }).join(', ')}`);
    }
    getProviderName() {
        return 'default';
    }
}
exports.default = DefaultCredentialsProvider;
class DefaultCredentialsProviderBuilder {
    build() {
        return new DefaultCredentialsProvider(this);
    }
}
//# sourceMappingURL=default.js.map