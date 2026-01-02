"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("util");
const session_1 = require("./session");
const utils = __importStar(require("../util/utils"));
const http_1 = require("./http");
const readFileAsync = (0, util_1.promisify)(fs_1.readFile);
class OIDCRoleArnCredentialsProviderBuilder {
    withOIDCProviderArn(oidcProviderArn) {
        this.oidcProviderArn = oidcProviderArn;
        return this;
    }
    withOIDCTokenFilePath(path) {
        this.oidcTokenFilePath = path;
        return this;
    }
    withRoleArn(roleArn) {
        this.roleArn = roleArn;
        return this;
    }
    withRoleSessionName(roleSessionName) {
        this.roleSessionName = roleSessionName;
        return this;
    }
    withDurationSeconds(durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }
    withStsEndpoint(stsEndpoint) {
        this.stsEndpoint = stsEndpoint;
        return this;
    }
    withStsRegionId(regionId) {
        this.stsRegionId = regionId;
        return this;
    }
    withPolicy(policy) {
        this.policy = policy;
        return this;
    }
    withEnableVpc(enableVpc) {
        this.enableVpc = enableVpc;
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
    build() {
        // set default values
        if (!this.oidcProviderArn) {
            this.oidcProviderArn = process.env.ALIBABA_CLOUD_OIDC_PROVIDER_ARN;
        }
        if (!this.oidcTokenFilePath) {
            this.oidcTokenFilePath = process.env.ALIBABA_CLOUD_OIDC_TOKEN_FILE;
        }
        if (!this.roleSessionName) {
            this.roleSessionName = process.env.ALIBABA_CLOUD_ROLE_SESSION_NAME;
        }
        if (!this.durationSeconds) {
            this.durationSeconds = 3600;
        }
        if (!this.roleArn) {
            this.roleArn = process.env.ALIBABA_CLOUD_ROLE_ARN;
        }
        if (!this.roleArn) {
            throw new Error('roleArn does not exist and env ALIBABA_CLOUD_ROLE_ARN is null.');
        }
        if (!this.oidcProviderArn) {
            throw new Error('oidcProviderArn does not exist and env ALIBABA_CLOUD_OIDC_PROVIDER_ARN is null.');
        }
        if (!this.oidcTokenFilePath) {
            throw new Error('oidcTokenFilePath is not exists and env ALIBABA_CLOUD_OIDC_TOKEN_FILE is null.');
        }
        if (!this.roleSessionName) {
            this.roleSessionName = 'credentials-nodejs-' + Date.now();
        }
        if (this.durationSeconds < 900) {
            throw new Error('session duration should be in the range of 900s - max session duration');
        }
        if (!this.stsRegionId) {
            this.stsRegionId = process.env.ALIBABA_CLOUD_STS_REGION;
        }
        if (!this.enableVpc) {
            this.enableVpc = process.env.ALIBABA_CLOUD_VPC_ENDPOINT_ENABLED && process.env.ALIBABA_CLOUD_VPC_ENDPOINT_ENABLED.toLowerCase() === 'true' || false;
        }
        // sts endpoint
        if (!this.stsEndpoint) {
            if (this.stsRegionId) {
                if (this.enableVpc) {
                    this.stsEndpoint = `sts-vpc.${this.stsRegionId}.aliyuncs.com`;
                }
                else {
                    this.stsEndpoint = `sts.${this.stsRegionId}.aliyuncs.com`;
                }
            }
            else {
                this.stsEndpoint = 'sts.aliyuncs.com';
            }
        }
        return new OIDCRoleArnCredentialsProvider(this);
    }
}
class OIDCRoleArnCredentialsProvider extends session_1.SessionCredentialProvider {
    static builder() {
        return new OIDCRoleArnCredentialsProviderBuilder();
    }
    constructor(builder) {
        super(session_1.STALE_TIME);
        this.doRequest = http_1.doRequest;
        this.refresher = this.getCredentialsInternal;
        this.roleArn = builder.roleArn;
        this.oidcProviderArn = builder.oidcProviderArn;
        this.oidcTokenFilePath = builder.oidcTokenFilePath;
        this.policy = builder.policy;
        this.durationSeconds = builder.durationSeconds;
        this.roleSessionName = builder.roleSessionName;
        this.stsEndpoint = builder.stsEndpoint;
        this.readTimeout = builder.readTimeout;
        this.connectTimeout = builder.connectTimeout;
        // used for mock
        this.doRequest = http_1.doRequest;
    }
    getProviderName() {
        return 'oidc_role_arn';
    }
    async getCredentialsInternal() {
        const oidcToken = await readFileAsync(this.oidcTokenFilePath, 'utf8');
        const builder = http_1.Request.builder().withMethod('POST').withProtocol('https').withHost(this.stsEndpoint).withReadTimeout(this.readTimeout || 10000).withConnectTimeout(this.connectTimeout || 5000);
        const queries = Object.create(null);
        queries['Version'] = '2015-04-01';
        queries['Action'] = 'AssumeRoleWithOIDC';
        queries['Format'] = 'JSON';
        queries['Timestamp'] = utils.timestamp();
        builder.withQueries(queries);
        const bodyForm = Object.create(null);
        bodyForm['OIDCProviderArn'] = this.oidcProviderArn;
        bodyForm['OIDCToken'] = oidcToken;
        bodyForm['RoleArn'] = this.roleArn;
        if (this.policy) {
            bodyForm['Policy'] = this.policy;
        }
        bodyForm['RoleSessionName'] = this.roleSessionName;
        bodyForm['DurationSeconds'] = `${this.durationSeconds}`;
        builder.withBodyForm(bodyForm);
        const headers = Object.create(null);
        // set headers
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        builder.withHeaders(headers);
        const request = builder.build();
        const response = await this.doRequest(request);
        if (response.statusCode !== 200) {
            throw new Error(`get sts token failed with OIDC: ${response.body.toString('utf8')}`);
        }
        let data;
        try {
            data = JSON.parse(response.body.toString('utf8'));
        }
        catch (ex) {
            throw new Error(`get sts token failed with OIDC, unmarshal fail: ${response.body.toString('utf8')}`);
        }
        if (!data || !data.Credentials) {
            throw new Error(`get sts token failed with OIDC`);
        }
        const { AccessKeyId, AccessKeySecret, SecurityToken, Expiration } = data.Credentials;
        if (!AccessKeyId || !AccessKeySecret || !SecurityToken) {
            throw new Error('get sts token failed with OIDC');
        }
        return new session_1.Session(AccessKeyId, AccessKeySecret, SecurityToken, Expiration);
    }
}
exports.default = OIDCRoleArnCredentialsProvider;
//# sourceMappingURL=oidc_role_arn.js.map