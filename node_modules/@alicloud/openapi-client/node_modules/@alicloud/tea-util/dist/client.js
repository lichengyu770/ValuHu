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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeOptions = exports.ExtendsParameters = void 0;
const stream_1 = require("stream");
const $tea = __importStar(require("@alicloud/tea-typescript"));
const kitx = __importStar(require("kitx"));
const querystring_1 = __importDefault(require("querystring"));
const os_1 = require("os");
const DEFAULT_USER_AGENT = `AlibabaCloud (${os_1.platform()}; ${os_1.arch()}) Node.js/${process.version} Core/1.0.1 TeaDSL/1`;
class ExtendsParameters extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            headers: 'headers',
            queries: 'queries',
        };
    }
    static types() {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            queries: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
        };
    }
}
exports.ExtendsParameters = ExtendsParameters;
class RuntimeOptions extends $tea.Model {
    constructor(map) {
        super(map);
    }
    static names() {
        return {
            autoretry: 'autoretry',
            ignoreSSL: 'ignoreSSL',
            key: 'key',
            cert: 'cert',
            ca: 'ca',
            maxAttempts: 'max_attempts',
            backoffPolicy: 'backoff_policy',
            backoffPeriod: 'backoff_period',
            readTimeout: 'readTimeout',
            connectTimeout: 'connectTimeout',
            httpProxy: 'httpProxy',
            httpsProxy: 'httpsProxy',
            noProxy: 'noProxy',
            maxIdleConns: 'maxIdleConns',
            keepAlive: 'keepAlive',
            extendsParameters: 'extendsParameters',
        };
    }
    static types() {
        return {
            autoretry: 'boolean',
            ignoreSSL: 'boolean',
            key: 'string',
            cert: 'string',
            ca: 'string',
            maxAttempts: 'number',
            backoffPolicy: 'string',
            backoffPeriod: 'number',
            readTimeout: 'number',
            connectTimeout: 'number',
            httpProxy: 'string',
            httpsProxy: 'string',
            noProxy: 'string',
            maxIdleConns: 'number',
            keepAlive: 'boolean',
            extendsParameters: ExtendsParameters,
        };
    }
}
exports.RuntimeOptions = RuntimeOptions;
function read(readable) {
    return new Promise((resolve, reject) => {
        let onData, onError, onEnd;
        var cleanup = function () {
            // cleanup
            readable.removeListener('error', onError);
            readable.removeListener('data', onData);
            readable.removeListener('end', onEnd);
        };
        var bufs = [];
        var size = 0;
        onData = function (buf) {
            bufs.push(buf);
            size += buf.length;
        };
        onError = function (err) {
            cleanup();
            reject(err);
        };
        onEnd = function () {
            cleanup();
            resolve(Buffer.concat(bufs, size));
        };
        readable.on('error', onError);
        readable.on('data', onData);
        readable.on('end', onEnd);
    });
}
class Client {
    static toString(buff) {
        return buff.toString();
    }
    static parseJSON(text) {
        return JSON.parse(text);
    }
    static async readAsBytes(stream) {
        return await read(stream);
    }
    static async readAsString(stream) {
        let buff = await Client.readAsBytes(stream);
        return Client.toString(buff);
    }
    static async readAsJSON(stream) {
        return Client.parseJSON(await Client.readAsString(stream));
    }
    static getNonce() {
        return kitx.makeNonce();
    }
    static getDateUTCString() {
        const now = new Date();
        return now.toUTCString();
    }
    static defaultString(real, defaultValue) {
        return real || defaultValue;
    }
    static defaultNumber(real, defaultValue) {
        return real || defaultValue;
    }
    static toFormString(val) {
        return querystring_1.default.stringify(val);
    }
    static toJSONString(val) {
        if (typeof val === 'string') {
            return val;
        }
        return JSON.stringify(val);
    }
    static toBytes(val) {
        return Buffer.from(val);
    }
    static empty(val) {
        return !val;
    }
    static equalString(val1, val2) {
        return val1 === val2;
    }
    static equalNumber(val1, val2) {
        return val1 === val2;
    }
    static isUnset(value) {
        if (typeof value === 'undefined') {
            return true;
        }
        if (value === null) {
            return true;
        }
        return false;
    }
    static stringifyMapValue(m) {
        if (!m) {
            return m;
        }
        const result = {};
        for (const [key, value] of Object.entries(m)) {
            if (typeof value === 'undefined' || value === null) {
                continue;
            }
            result[key] = String(value);
        }
        return result;
    }
    static anyifyMapValue(m) {
        return m;
    }
    static assertAsBoolean(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        throw new Error(`The value is not a boolean`);
    }
    static assertAsString(value) {
        if (typeof value === 'string') {
            return value;
        }
        throw new Error(`The value is not a string`);
    }
    static assertAsNumber(value) {
        if (typeof value === 'number') {
            return value;
        }
        throw new Error(`The value is not a number`);
    }
    /**
     * Assert a value, if it is a integer, return it, otherwise throws
     * @return the integer value
     */
    static assertAsInteger(value) {
        if (Number.isInteger(value)) {
            return value;
        }
        throw new Error(`The value is not a int number`);
    }
    static assertAsMap(value) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return value;
        }
        throw new Error(`The value is not a object`);
    }
    static assertAsArray(value) {
        if (Array.isArray(value)) {
            return value;
        }
        throw new Error(`The value is not array`);
    }
    static assertAsBytes(value) {
        if (Buffer.isBuffer(value)) {
            return value;
        }
        throw new Error(`The value is not bytes`);
    }
    static getUserAgent(userAgent) {
        if (!userAgent || !userAgent.length) {
            return DEFAULT_USER_AGENT;
        }
        return DEFAULT_USER_AGENT + " " + userAgent;
    }
    static is2xx(code) {
        return code >= 200 && code < 300;
    }
    static is3xx(code) {
        return code >= 300 && code < 400;
    }
    static is4xx(code) {
        return code >= 400 && code < 500;
    }
    static is5xx(code) {
        return code >= 500 && code < 600;
    }
    static validateModel(m) {
    }
    static toMap(inputModel) {
        return $tea.toMap(inputModel);
    }
    static async sleep(millisecond) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, millisecond);
        });
    }
    static toArray(input) {
        if (!(input instanceof Array)) {
            return null;
        }
        let ret = [];
        input.forEach((model) => {
            if (!model) {
                return;
            }
            ret.push($tea.toMap(model));
        });
        return ret;
    }
    /**
     * Assert a value, if it is a readable, return it, otherwise throws
     * @return the readable value
     */
    static assertAsReadable(value) {
        if (value instanceof stream_1.Readable) {
            return value;
        }
        throw new Error(`The value is not a readable`);
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map