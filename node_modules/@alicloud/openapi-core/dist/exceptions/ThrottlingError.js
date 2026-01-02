"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlingError = void 0;
const AlibabaCloudError_1 = require("./AlibabaCloudError");
class ThrottlingError extends AlibabaCloudError_1.AlibabaCloudError {
    constructor(map) {
        super(map);
        this.name = "ThrottlingError";
        Object.setPrototypeOf(this, ThrottlingError.prototype);
        this.retryAfter = map.retryAfter;
    }
}
exports.ThrottlingError = ThrottlingError;
//# sourceMappingURL=ThrottlingError.js.map