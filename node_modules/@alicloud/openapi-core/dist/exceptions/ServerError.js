"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = void 0;
const AlibabaCloudError_1 = require("./AlibabaCloudError");
class ServerError extends AlibabaCloudError_1.AlibabaCloudError {
    constructor(map) {
        super(map);
        this.name = "ServerError";
        Object.setPrototypeOf(this, ServerError.prototype);
    }
}
exports.ServerError = ServerError;
//# sourceMappingURL=ServerError.js.map