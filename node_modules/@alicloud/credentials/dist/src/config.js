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
const $tea = __importStar(require("@alicloud/tea-typescript"));
class Config extends $tea.Model {
    static names() {
        return {
            accessKeyId: 'accessKeyId',
            accessKeySecret: 'accessKeySecret',
            securityToken: 'securityToken',
            bearerToken: 'bearerToken',
            durationSeconds: 'durationSeconds',
            roleArn: 'roleArn',
            policy: 'policy',
            roleSessionExpiration: 'roleSessionExpiration',
            roleSessionName: 'roleSessionName',
            externalId: 'externalId',
            stsEndpoint: 'stsEndpoint',
            stsRegionId: 'stsRegionId',
            enableVpc: 'enableVpc',
            timeout: 'readTimeout',
            connectTimeout: 'connectTimeout',
            publicKeyId: 'publicKeyId',
            privateKeyFile: 'privateKeyFile',
            roleName: 'roleName',
            enableIMDSv2: 'enableIMDSv2',
            disableIMDSv1: 'disableIMDSv1',
            asyncCredentialUpdateEnabled: 'asyncCredentialUpdateEnabled',
            metadataTokenDuration: 'metadataTokenDuration',
            credentialsURI: 'credentialsURI',
            oidcProviderArn: 'oidcProviderArn',
            oidcTokenFilePath: 'oidcTokenFilePath',
            type: 'type',
        };
    }
    static types() {
        return {
            accessKeyId: 'string',
            accessKeySecret: 'string',
            securityToken: 'string',
            bearerToken: 'string',
            durationSeconds: 'number',
            roleArn: 'string',
            policy: 'string',
            roleSessionExpiration: 'number',
            roleSessionName: 'string',
            externalId: 'string',
            stsEndpoint: 'string',
            stsRegionId: 'string',
            enableVpc: 'string',
            timeout: 'number',
            connectTimeout: 'number',
            publicKeyId: 'string',
            privateKeyFile: 'string',
            roleName: 'string',
            enableIMDSv2: 'boolean',
            disableIMDSv1: 'boolean',
            asyncCredentialUpdateEnabled: 'boolean',
            metadataTokenDuration: 'number',
            credentialsURI: 'string',
            oidcProviderArn: 'string',
            oidcTokenFilePath: 'string',
            type: 'string',
        };
    }
    constructor(config) {
        super(config);
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map