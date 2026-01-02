"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlibabaCloudError = void 0;
// This file is auto-generated, don't edit it
const $dara = __importStar(require("@darabonba/typescript"));
class AlibabaCloudError extends $dara.ResponseError {
    constructor(map) {
        super(map);
        this.name = "AlibabaCloudError";
        Object.setPrototypeOf(this, AlibabaCloudError.prototype);
        this.statusCode = map.statusCode;
        this.code = map.code;
        this.description = map.description;
        this.requestId = map.requestId;
    }
}
exports.AlibabaCloudError = AlibabaCloudError;
//# sourceMappingURL=AlibabaCloudError.js.map