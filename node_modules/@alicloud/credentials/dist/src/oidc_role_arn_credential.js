"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const session_credential_1 = __importDefault(require("./session_credential"));
const http_1 = require("./util/http");
const config_1 = __importDefault(require("./config"));
const fs_1 = __importDefault(require("fs"));
class OidcRoleArnCredential extends session_credential_1.default {
    constructor(config, runtime = {}) {
        if (!config.roleArn) {
            config.roleArn = process.env.ALIBABA_CLOUD_ROLE_ARN;
            if (!config.roleArn) {
                throw new Error('roleArn does not exist and env ALIBABA_CLOUD_ROLE_ARN is null.');
            }
        }
        if (!config.oidcProviderArn) {
            config.oidcProviderArn = process.env.ALIBABA_CLOUD_OIDC_PROVIDER_ARN;
            if (!config.oidcProviderArn) {
                throw new Error('oidcProviderArn does not exist and env ALIBABA_CLOUD_OIDC_PROVIDER_ARN is null.');
            }
        }
        if (!config.oidcTokenFilePath) {
            config.oidcTokenFilePath = process.env.ALIBABA_CLOUD_OIDC_TOKEN_FILE;
            if (!config.oidcTokenFilePath) {
                throw new Error('oidcTokenFilePath is not exists and env ALIBABA_CLOUD_OIDC_TOKEN_FILE is null.');
            }
        }
        if (!config.roleSessionName && process.env.ALIBABA_CLOUD_ROLE_SESSION_NAME) {
            config.roleSessionName = process.env.ALIBABA_CLOUD_ROLE_SESSION_NAME;
        }
        const conf = new config_1.default({
            type: 'oidc_role_arn'
        });
        super(conf);
        this.oidcTokenFilePath = config.oidcTokenFilePath;
        this.roleArn = config.roleArn;
        this.policy = config.policy;
        this.oidcProviderArn = config.oidcProviderArn;
        this.durationSeconds = config.roleSessionExpiration || 3600;
        this.roleSessionName = config.roleSessionName || 'role_session_name';
        runtime.method = 'POST';
        runtime.anonymous = true;
        this.runtime = runtime;
        this.host = 'https://sts.aliyuncs.com';
    }
    getOdicToken(oidcTokenFilePath) {
        if (!fs_1.default.existsSync(oidcTokenFilePath)) {
            throw new Error(`oidcTokenFilePath ${oidcTokenFilePath}  is not exists.`);
        }
        let oidcToken = null;
        try {
            oidcToken = fs_1.default.readFileSync(oidcTokenFilePath, 'utf-8');
        }
        catch (err) {
            throw new Error(`oidcTokenFilePath ${oidcTokenFilePath} cannot be read.`);
        }
        return oidcToken;
    }
    async updateCredential() {
        const oidcToken = this.getOdicToken(this.oidcTokenFilePath);
        const params = {
            Action: 'AssumeRoleWithOIDC',
            RoleArn: this.roleArn,
            OIDCProviderArn: this.oidcProviderArn,
            OIDCToken: oidcToken,
            DurationSeconds: this.durationSeconds,
            RoleSessionName: this.roleSessionName
        };
        if (this.policy) {
            params.policy = this.policy;
        }
        const json = await (0, http_1.request)(this.host, params, this.runtime);
        this.sessionCredential = json.Credentials;
    }
}
exports.default = OidcRoleArnCredential;
//# sourceMappingURL=oidc_role_arn_credential.js.map