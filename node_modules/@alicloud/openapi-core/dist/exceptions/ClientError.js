"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientError = void 0;
const AlibabaCloudError_1 = require("./AlibabaCloudError");
class ClientError extends AlibabaCloudError_1.AlibabaCloudError {
    constructor(map) {
        super(map);
        this.name = "ClientError";
        Object.setPrototypeOf(this, ClientError.prototype);
        this.accessDeniedDetail = map.accessDeniedDetail;
    }
}
exports.ClientError = ClientError;
//# sourceMappingURL=ClientError.js.map