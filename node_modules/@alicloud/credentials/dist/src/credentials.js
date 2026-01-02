"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsBuilder = void 0;
class Credentials {
    constructor(builder) {
        this.accessKeyId = builder.accessKeyId;
        this.accessKeySecret = builder.accessKeySecret;
        this.securityToken = builder.securityToken;
        this.providerName = builder.providerName;
    }
    static builder() {
        return new CredentialsBuilder();
    }
}
exports.default = Credentials;
class CredentialsBuilder {
    withAccessKeyId(value) {
        this.accessKeyId = value;
        return this;
    }
    withAccessKeySecret(value) {
        this.accessKeySecret = value;
        return this;
    }
    withSecurityToken(value) {
        this.securityToken = value;
        return this;
    }
    withProviderName(value) {
        this.providerName = value;
        return this;
    }
    build() {
        return new Credentials(this);
    }
}
exports.CredentialsBuilder = CredentialsBuilder;
//# sourceMappingURL=credentials.js.map