"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ecs_ram_role_credential_1 = __importDefault(require("../ecs_ram_role_credential"));
exports.default = {
    getCredential() {
        const roleName = process.env.ALIBABA_CLOUD_ECS_METADATA;
        const enableIMDSv2 = process.env.ALIBABA_CLOUD_ECS_IMDSV2_ENABLE;
        if (roleName && roleName.length) {
            return new ecs_ram_role_credential_1.default(roleName, {}, enableIMDSv2 && enableIMDSv2.toLowerCase() === 'true');
        }
        return null;
    }
};
//# sourceMappingURL=instance_ram_role_credentials_provider.js.map