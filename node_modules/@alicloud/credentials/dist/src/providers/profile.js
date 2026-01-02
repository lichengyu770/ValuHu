"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const credentials_1 = __importDefault(require("../credentials"));
const utils_1 = require("../util/utils");
const static_ak_1 = __importDefault(require("./static_ak"));
const ecs_ram_role_1 = __importDefault(require("./ecs_ram_role"));
const ram_role_arn_1 = __importDefault(require("./ram_role_arn"));
class ProfileCredentialsProvider {
    async getCredentials() {
        if (!this.innerProvider) {
            let sharedCfgPath = process.env.ALIBABA_CLOUD_CREDENTIALS_FILE;
            if (!sharedCfgPath) {
                if (!this.homedir) {
                    throw new Error('cannot found home dir');
                }
                sharedCfgPath = path_1.default.join(this.homedir, '.alibabacloud/credentials');
            }
            const ini = await (0, utils_1.loadIni)(sharedCfgPath);
            this.innerProvider = this.getCredentialsProvider(ini);
        }
        const credentials = await this.innerProvider.getCredentials();
        return credentials_1.default.builder()
            .withAccessKeyId(credentials.accessKeyId)
            .withAccessKeySecret(credentials.accessKeySecret)
            .withSecurityToken(credentials.securityToken)
            .withProviderName(`${this.getProviderName()}/${this.innerProvider.getProviderName()}`)
            .build();
    }
    getCredentialsProvider(ini) {
        const config = ini[this.profileName] || {};
        if (!config.type) {
            throw new Error(`Can not find credential type for "${this.profileName}"`);
        }
        switch (config.type) {
            case 'access_key':
                return static_ak_1.default.builder()
                    .withAccessKeyId(config.access_key_id)
                    .withAccessKeySecret(config.access_key_secret)
                    .build();
            case 'ecs_ram_role':
                return ecs_ram_role_1.default.builder()
                    .withRoleName(config.role_name)
                    .build();
            case 'ram_role_arn':
                {
                    const previous = static_ak_1.default.builder()
                        .withAccessKeyId(config.access_key_id)
                        .withAccessKeySecret(config.access_key_secret)
                        .build();
                    return ram_role_arn_1.default.builder()
                        .withCredentialsProvider(previous)
                        .withRoleArn(config.role_arn)
                        .withRoleSessionName(config.role_session_name)
                        .withPolicy(config.policy)
                        // .withStsEndpoint(config.stsEndpoint)
                        // .withStsRegionId(config.stsRegionId)
                        // .withEnableVpc(config.enableVpc)
                        // .withExternalId(config.enableVpc)
                        .build();
                }
            default:
                throw new Error('Invalid type option, support: access_key, ecs_ram_role, ram_role_arn');
        }
    }
    getProviderName() {
        return 'profile';
    }
    static builder() {
        return new ProfileCredentialsProviderBuilder();
    }
    constructor(builder) {
        // used for mock
        this.homedir = os_1.default.homedir();
        this.profileName = builder.profileName;
    }
}
exports.default = ProfileCredentialsProvider;
class ProfileCredentialsProviderBuilder {
    withProfileName(profileName) {
        this.profileName = profileName;
        return this;
    }
    build() {
        // 优先级：
        // 1. 使用显示指定的 profileName
        // 2. 使用环境变量（ALIBABA_CLOUD_PROFILE）指定的 profileName
        // 3. 兜底使用 default 作为 profileName
        if (!this.profileName) {
            this.profileName = process.env.ALIBABA_CLOUD_PROFILE || 'default';
        }
        return new ProfileCredentialsProvider(this);
    }
}
//# sourceMappingURL=profile.js.map