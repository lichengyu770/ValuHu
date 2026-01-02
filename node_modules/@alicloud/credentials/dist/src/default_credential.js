"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const credential_model_1 = __importDefault(require("./credential_model"));
class DefaultCredential {
    constructor(config) {
        this.accessKeyId = config.accessKeyId || '';
        this.accessKeySecret = config.accessKeySecret || '';
        this.securityToken = config.securityToken || '';
        this.bearerToken = config.bearerToken || '';
        this.type = config.type || '';
    }
    async getAccessKeyId() {
        return this.accessKeyId;
    }
    async getAccessKeySecret() {
        return this.accessKeySecret;
    }
    async getSecurityToken() {
        return this.securityToken;
    }
    getBearerToken() {
        return this.bearerToken;
    }
    getType() {
        return this.type;
    }
    async getCredential() {
        return new credential_model_1.default({
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
            securityToken: this.securityToken,
            bearerToken: this.bearerToken,
            type: this.type,
        });
    }
}
exports.default = DefaultCredential;
//# sourceMappingURL=default_credential.js.map