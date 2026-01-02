"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.getConfiguration = void 0;
const fs_1 = require("fs");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const credentials_1 = __importDefault(require("../credentials"));
const static_ak_1 = __importDefault(require("./static_ak"));
const static_sts_1 = __importDefault(require("./static_sts"));
const ram_role_arn_1 = __importDefault(require("./ram_role_arn"));
const oidc_role_arn_1 = __importDefault(require("./oidc_role_arn"));
const ecs_ram_role_1 = __importDefault(require("./ecs_ram_role"));
const readFileAsync = (0, util_1.promisify)(fs_1.readFile);
class CLIProfileCredentialsProviderBuilder {
    build() {
        // 优先级：
        // 1. 使用显示指定的 profileName
        // 2. 使用环境变量（ALIBABA_CLOUD_PROFILE）制定的 profileName
        // 3. 使用 CLI 配置中的当前 profileName
        if (!this.profileName) {
            this.profileName = process.env.ALIBABA_CLOUD_PROFILE;
        }
        if (process.env.ALIBABA_CLOUD_CLI_PROFILE_DISABLED && process.env.ALIBABA_CLOUD_CLI_PROFILE_DISABLED.toLowerCase() === 'true') {
            throw new Error('the CLI profile is disabled');
        }
        return new CLIProfileCredentialsProvider(this);
    }
    withProfileName(profileName) {
        this.profileName = profileName;
        return this;
    }
}
class Configuration {
}
async function getConfiguration(cfgPath) {
    let content;
    try {
        content = await readFileAsync(cfgPath, 'utf8');
    }
    catch (ex) {
        throw new Error(`reading aliyun cli config from '${cfgPath}' failed.`);
    }
    let conf;
    try {
        conf = JSON.parse(content);
    }
    catch (ex) {
        throw new Error(`parse aliyun cli config from '${cfgPath}' failed: ${content}`);
    }
    if (!conf || !conf.profiles || conf.profiles.length === 0) {
        throw new Error(`no any configured profiles in '${cfgPath}'`);
    }
    return conf;
}
exports.getConfiguration = getConfiguration;
function getProfile(conf, profileName) {
    for (const p of conf.profiles) {
        if (p.name === profileName) {
            return p;
        }
    }
    throw new Error(`unable to get profile with '${profileName}'`);
}
exports.getProfile = getProfile;
class CLIProfileCredentialsProvider {
    static builder() {
        return new CLIProfileCredentialsProviderBuilder();
    }
    constructor(builder) {
        // used for mock
        this.homedir = os_1.default.homedir();
        this.profileName = builder.profileName;
    }
    getCredentialsProvider(conf, profileName) {
        const p = getProfile(conf, profileName);
        switch (p.mode) {
            case 'AK':
                return static_ak_1.default.builder()
                    .withAccessKeyId(p.access_key_id)
                    .withAccessKeySecret(p.access_key_secret)
                    .build();
            case 'StsToken':
                return static_sts_1.default.builder()
                    .withAccessKeyId(p.access_key_id)
                    .withAccessKeySecret(p.access_key_secret)
                    .withSecurityToken(p.sts_token)
                    .build();
            case 'RamRoleArn': {
                const previousProvider = static_ak_1.default.builder()
                    .withAccessKeyId(p.access_key_id)
                    .withAccessKeySecret(p.access_key_secret)
                    .build();
                return ram_role_arn_1.default.builder()
                    .withCredentialsProvider(previousProvider)
                    .withRoleArn(p.ram_role_arn)
                    .withRoleSessionName(p.ram_session_name)
                    .withDurationSeconds(p.expired_seconds)
                    .withStsRegionId(p.sts_region)
                    .withStsEndpoint(p.sts_endpoint)
                    .withEnableVpc(p.enable_vpc)
                    .build();
            }
            case 'EcsRamRole':
                return ecs_ram_role_1.default.builder().withRoleName(p.ram_role_name).build();
            case 'OIDC':
                return oidc_role_arn_1.default.builder()
                    .withOIDCTokenFilePath(p.oidc_token_file)
                    .withOIDCProviderArn(p.oidc_provider_arn)
                    .withRoleArn(p.ram_role_arn)
                    .withStsRegionId(p.sts_region)
                    .withDurationSeconds(p.expired_seconds)
                    .withRoleSessionName(p.ram_session_name)
                    .withDurationSeconds(p.duration_seconds)
                    .withEnableVpc(p.enable_vpc)
                    .build();
            case 'ChainableRamRoleArn': {
                const previousProvider = this.getCredentialsProvider(conf, p.source_profile);
                return ram_role_arn_1.default.builder()
                    .withCredentialsProvider(previousProvider)
                    .withRoleArn(p.ram_role_arn)
                    .withRoleSessionName(p.ram_session_name)
                    .withDurationSeconds(p.expired_seconds)
                    .withStsRegionId(p.sts_region)
                    .build();
            }
            default:
                throw new Error(`unsupported profile mode '${p.mode}'`);
        }
    }
    async getCredentials() {
        if (!this.innerProvider) {
            if (!this.homedir) {
                throw new Error('cannot found home dir');
            }
            const cfgPath = path_1.default.join(this.homedir, '.aliyun/config.json');
            const conf = await getConfiguration(cfgPath);
            const profileName = this.profileName || conf.current;
            this.innerProvider = this.getCredentialsProvider(conf, profileName);
        }
        const credentials = await this.innerProvider.getCredentials();
        return credentials_1.default.builder()
            .withAccessKeyId(credentials.accessKeyId)
            .withAccessKeySecret(credentials.accessKeySecret)
            .withSecurityToken(credentials.securityToken)
            .withProviderName(`${this.getProviderName()}/${this.innerProvider.getProviderName()}`)
            .build();
    }
    getProviderName() {
        return 'cli_profile';
    }
}
exports.default = CLIProfileCredentialsProvider;
//# sourceMappingURL=cli_profile.js.map