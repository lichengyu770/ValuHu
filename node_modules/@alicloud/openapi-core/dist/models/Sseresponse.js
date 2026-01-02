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
exports.SSEResponse = void 0;
// This file is auto-generated, don't edit it
const $dara = __importStar(require("@darabonba/typescript"));
/**
 * @remarks
 * This is for OpenApi SDK
 */
class SSEResponse extends $dara.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            statusCode: 'statusCode',
            event: 'event',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            statusCode: 'number',
            event: $dara.SSEEvent,
        };
    }
    validate() {
        if (this.headers) {
            $dara.Model.validateMap(this.headers);
        }
        $dara.Model.validateRequired("headers", this.headers);
        $dara.Model.validateRequired("statusCode", this.statusCode);
        $dara.Model.validateRequired("event", this.event);
        super.validate();
    }
}
exports.SSEResponse = SSEResponse;
//# sourceMappingURL=Sseresponse.js.map