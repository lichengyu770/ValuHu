"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oidc_role_arn_credential_1 = __importDefault(require("../oidc_role_arn_credential"));
const config_1 = __importDefault(require("../config"));
exports.default = {
    getCredential() {
        if (process.env.ALIBABA_CLOUD_ROLE_ARN
            && process.env.ALIBABA_CLOUD_OIDC_PROVIDER_ARN
            && process.env.ALIBABA_CLOUD_OIDC_TOKEN_FILE) {
            return new oidc_role_arn_credential_1.default(new config_1.default({}));
        }
        return null;
    }
};
//# sourceMappingURL=oidc_role_arn_credentials_provider.js.map