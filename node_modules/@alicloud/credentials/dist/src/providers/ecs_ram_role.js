"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("./http");
const session_1 = require("./session");
const PREFETCH_TIME = 60 * 60;
const defaultMetadataTokenDuration = 21600; // 6 hours
class ECSRAMRoleCredentialsProvider extends session_1.SessionCredentialProvider {
    static builder() {
        return new ECSRAMRoleCredentialsProviderBuilder();
    }
    constructor(builder) {
        super(session_1.STALE_TIME, PREFETCH_TIME);
        // for mock
        this.doRequest = http_1.doRequest;
        this.refresher = this.getCredentialsInternal;
        this.roleName = builder.roleName;
        this.disableIMDSv1 = builder.disableIMDSv1;
        this.readTimeout = builder.readTimeout;
        this.connectTimeout = builder.connectTimeout;
        this.checker = null;
        this.shouldRefreshCred = false;
        if (builder.asyncCredentialUpdateEnabled) {
            this.checker = this.checkCredentialsUpdateAsynchronously();
        }
    }
    checkCredentialsUpdateAsynchronously() {
        return setTimeout(async () => {
            try {
                if (this.shouldRefreshCred) {
                    await this.getCredentials();
                }
            }
            catch (err) {
                console.error('CheckCredentialsUpdateAsynchronously Error:', err);
            }
            finally {
                this.checker = this.checkCredentialsUpdateAsynchronously();
            }
        }, 1000 * 60);
    }
    close() {
        if (this.checker != null) {
            clearTimeout(this.checker);
            this.checker = null;
        }
    }
    async getMetadataToken() {
        // PUT http://100.100.100.200/latest/api/token
        const request = http_1.Request.builder()
            .withMethod('PUT')
            .withProtocol('http')
            .withHost('100.100.100.200')
            .withPath('/latest/api/token')
            .withHeaders({
            'x-aliyun-ecs-metadata-token-ttl-seconds': `${defaultMetadataTokenDuration}`
        })
            .withReadTimeout(this.readTimeout || 1000)
            .withConnectTimeout(this.connectTimeout || 1000)
            .build();
        // ConnectTimeout: 5 * time.Second,
        //   ReadTimeout: 5 * time.Second,
        try {
            const response = await this.doRequest(request);
            if (response.statusCode !== 200) {
                throw new Error(`get metadata token failed with ${response.statusCode}`);
            }
            return response.body.toString('utf8');
        }
        catch (error) {
            if (this.disableIMDSv1) {
                throw error;
            }
            return null;
        }
    }
    async getRoleName() {
        const builder = http_1.Request.builder()
            .withMethod('GET')
            .withProtocol('http')
            .withHost('100.100.100.200')
            .withPath('/latest/meta-data/ram/security-credentials/')
            .withReadTimeout(this.readTimeout || 1000)
            .withConnectTimeout(this.connectTimeout || 1000);
        const metadataToken = await this.getMetadataToken();
        if (metadataToken !== null) {
            builder.withHeaders({
                'x-aliyun-ecs-metadata-token': metadataToken
            });
        }
        // ConnectTimeout: 5 * time.Second,
        // ReadTimeout: 5 * time.Second,
        const request = builder.build();
        const response = await this.doRequest(request);
        if (response.statusCode !== 200) {
            throw new Error(`get role name failed: ${request.method} ${request.toRequestURL()} ${response.statusCode}`);
        }
        return response.body.toString().trim();
    }
    async getCredentialsInternal() {
        let roleName = this.roleName;
        if (!roleName) {
            roleName = await this.getRoleName();
        }
        const builder = http_1.Request.builder()
            .withMethod('GET')
            .withProtocol('http')
            .withHost('100.100.100.200')
            .withPath(`/latest/meta-data/ram/security-credentials/${roleName}`)
            .withReadTimeout(this.readTimeout || 1000)
            .withConnectTimeout(this.connectTimeout || 1000);
        // ConnectTimeout: 5 * time.Second,
        //   ReadTimeout: 5 * time.Second,
        //     Headers: map[string]string{ },
        const metadataToken = await this.getMetadataToken();
        if (metadataToken !== null) {
            builder.withHeaders({
                'x-aliyun-ecs-metadata-token': metadataToken
            });
        }
        const request = builder.build();
        const response = await this.doRequest(request);
        if (response.statusCode !== 200) {
            throw new Error(`get sts token failed, httpStatus: ${response.statusCode}, message = ${response.body.toString()}`);
        }
        let data;
        try {
            data = JSON.parse(response.body.toString());
        }
        catch (ex) {
            throw new Error(`get sts token failed, json parse failed: ${ex.message}`);
        }
        if (!data || !data.AccessKeyId || !data.AccessKeySecret || !data.SecurityToken) {
            throw new Error('get sts token failed');
        }
        if (data.Code !== 'Success') {
            throw new Error('refresh Ecs sts token err, Code is not Success');
        }
        this.shouldRefreshCred = true;
        return new session_1.Session(data.AccessKeyId, data.AccessKeySecret, data.SecurityToken, data.Expiration);
    }
    getProviderName() {
        return 'ecs_ram_role';
    }
}
exports.default = ECSRAMRoleCredentialsProvider;
class ECSRAMRoleCredentialsProviderBuilder {
    constructor() {
        this.disableIMDSv1 = false;
        this.asyncCredentialUpdateEnabled = false;
    }
    withRoleName(roleName) {
        this.roleName = roleName;
        return this;
    }
    withDisableIMDSv1(disableIMDSv1) {
        this.disableIMDSv1 = disableIMDSv1;
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
    withAsyncCredentialUpdateEnabled(asyncCredentialUpdateEnabled) {
        this.asyncCredentialUpdateEnabled = asyncCredentialUpdateEnabled;
        return this;
    }
    build() {
        // 允许通过环境变量强制关闭 IMDS
        if (process.env.ALIBABA_CLOUD_ECS_METADATA_DISABLED && process.env.ALIBABA_CLOUD_ECS_METADATA_DISABLED.toLowerCase() === 'true') {
            throw new Error('IMDS credentials is disabled');
        }
        // 设置 roleName 默认值
        if (!this.roleName) {
            this.roleName = process.env.ALIBABA_CLOUD_ECS_METADATA;
        }
        // 允许通过环境变量强制关闭 V1
        if (process.env.ALIBABA_CLOUD_IMDSV1_DISABLED && process.env.ALIBABA_CLOUD_IMDSV1_DISABLED.toLowerCase() === 'true') {
            this.disableIMDSv1 = true;
        }
        return new ECSRAMRoleCredentialsProvider(this);
    }
}
//# sourceMappingURL=ecs_ram_role.js.map