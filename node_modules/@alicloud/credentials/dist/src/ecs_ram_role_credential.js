"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const session_credential_1 = __importDefault(require("./session_credential"));
const httpx_1 = __importDefault(require("httpx"));
const config_1 = __importDefault(require("./config"));
const SECURITY_CRED_URL = 'http://100.100.100.200/latest/meta-data/ram/security-credentials/';
const SECURITY_CRED_TOKEN_URL = 'http://100.100.100.200/latest/api/token';
class EcsRamRoleCredential extends session_credential_1.default {
    constructor(roleName = '', runtime = {}, enableIMDSv2 = false, metadataTokenDuration = 21600) {
        const conf = new config_1.default({
            type: 'ecs_ram_role',
        });
        super(conf);
        this.roleName = roleName;
        this.enableIMDSv2 = enableIMDSv2;
        this.metadataTokenDuration = metadataTokenDuration;
        this.runtime = runtime;
        this.sessionCredential = null;
        this.metadataToken = null;
        this.staleTime = 0;
    }
    async getBody(url, options = {}) {
        const response = await httpx_1.default.request(url, options);
        return (await httpx_1.default.read(response, 'utf8'));
    }
    async getMetadataToken() {
        if (this.needToRefresh()) {
            let tmpTime = new Date().getTime() + this.metadataTokenDuration * 1000;
            const response = await httpx_1.default.request(SECURITY_CRED_TOKEN_URL, {
                headers: {
                    'X-aliyun-ecs-metadata-token-ttl-seconds': `${this.metadataTokenDuration}`
                },
                method: "PUT"
            });
            if (response.statusCode !== 200) {
                throw new Error(`Failed to get token from ECS Metadata Service. HttpCode=${response.statusCode}`);
            }
            this.staleTime = tmpTime;
            return (await httpx_1.default.read(response, 'utf8'));
        }
        return this.metadataToken;
    }
    async updateCredential() {
        let options = {};
        if (this.enableIMDSv2) {
            this.metadataToken = await this.getMetadataToken();
            options = {
                headers: {
                    'X-aliyun-ecs-metadata-token': this.metadataToken
                },
                readTimeout: this.readTimeout,
                connectTimeout: this.connectTimeout
            };
        }
        const roleName = await this.getRoleName();
        const url = SECURITY_CRED_URL + roleName;
        const body = await this.getBody(url, options);
        const json = JSON.parse(body);
        this.sessionCredential = {
            AccessKeyId: json.AccessKeyId,
            AccessKeySecret: json.AccessKeySecret,
            Expiration: json.Expiration,
            SecurityToken: json.SecurityToken,
        };
    }
    async getRoleName() {
        if (this.roleName && this.roleName.length) {
            return this.roleName;
        }
        return await this.getBody(SECURITY_CRED_URL);
    }
    needToRefresh() {
        return new Date().getTime() >= this.staleTime;
    }
}
exports.default = EcsRamRoleCredential;
//# sourceMappingURL=ecs_ram_role_credential.js.map