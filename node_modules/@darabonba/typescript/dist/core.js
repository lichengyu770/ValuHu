"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRetryable = exports.getBackoffTime = exports.allowRetry = exports.cast = exports.RuntimeOptions = exports.ExtendsParameters = exports.FileField = exports.Model = exports.toMap = exports.doAction = exports.Response = exports.Request = exports.BytesReadable = void 0;
var querystring = __importStar(require("querystring"));
var http_1 = require("http");
var https_1 = require("https");
var stream_1 = require("stream");
var httpx = __importStar(require("httpx"));
var url_1 = require("url");
var retry_1 = require("./retry");
var error_1 = require("./error");
var $tea = __importStar(require("@alicloud/tea-typescript"));
var BytesReadable = /** @class */ (function (_super) {
    __extends(BytesReadable, _super);
    function BytesReadable(value) {
        var _this = _super.call(this) || this;
        if (typeof value === 'string') {
            _this.value = Buffer.from(value);
        }
        else if (Buffer.isBuffer(value)) {
            _this.value = value;
        }
        return _this;
    }
    BytesReadable.prototype._read = function () {
        this.push(this.value);
        this.push(null);
    };
    return BytesReadable;
}(stream_1.Readable));
exports.BytesReadable = BytesReadable;
var Request = /** @class */ (function () {
    function Request() {
        this.headers = {};
        this.query = {};
    }
    return Request;
}());
exports.Request = Request;
var Response = /** @class */ (function () {
    function Response(httpResponse) {
        this.statusCode = httpResponse.statusCode;
        this.statusMessage = httpResponse.statusMessage;
        this.headers = this.convertHeaders(httpResponse.headers);
        this.body = httpResponse;
    }
    Response.prototype.convertHeaders = function (headers) {
        var results = {};
        var keys = Object.keys(headers);
        for (var index = 0; index < keys.length; index++) {
            var key = keys[index];
            results[key] = headers[key];
        }
        return results;
    };
    Response.prototype.readBytes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buff;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, httpx.read(this.body, '')];
                    case 1:
                        buff = _a.sent();
                        return [2 /*return*/, buff];
                }
            });
        });
    };
    return Response;
}());
exports.Response = Response;
function buildURL(request) {
    var url = "".concat(request.protocol, "://").concat(request.headers['host']);
    if (request.port) {
        url += ":".concat(request.port);
    }
    url += "".concat(request.pathname);
    var urlInfo = (0, url_1.parse)(url);
    if (request.query && Object.keys(request.query).length > 0) {
        if (urlInfo.query) {
            url += "&".concat(querystring.stringify(request.query));
        }
        else {
            url += "?".concat(querystring.stringify(request.query));
        }
    }
    return url;
}
function isModelClass(t) {
    if (!t) {
        return false;
    }
    return typeof t.types === 'function' && typeof t.names === 'function';
}
function doAction(request, runtime) {
    if (runtime === void 0) { runtime = null; }
    return __awaiter(this, void 0, void 0, function () {
        var url, method, options, agentOptions, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = buildURL(request);
                    method = (request.method || 'GET').toUpperCase();
                    options = {
                        method: method,
                        headers: request.headers
                    };
                    if (method !== 'GET' && method !== 'HEAD') {
                        options.data = request.body;
                    }
                    if (runtime) {
                        if (typeof runtime.timeout !== 'undefined') {
                            options.timeout = Number(runtime.timeout);
                        }
                        if (typeof runtime.readTimeout !== 'undefined') {
                            options.readTimeout = Number(runtime.readTimeout);
                        }
                        if (typeof runtime.connectTimeout !== 'undefined') {
                            options.connectTimeout = Number(runtime.connectTimeout);
                        }
                        if (typeof runtime.ignoreSSL !== 'undefined') {
                            options.rejectUnauthorized = !runtime.ignoreSSL;
                        }
                        if (typeof runtime.key !== 'undefined') {
                            options.key = String(runtime.key);
                        }
                        if (typeof runtime.cert !== 'undefined') {
                            options.cert = String(runtime.cert);
                        }
                        if (typeof runtime.ca !== 'undefined') {
                            options.ca = String(runtime.ca);
                        }
                        agentOptions = {
                            keepAlive: true,
                        };
                        if (typeof runtime.keepAlive !== 'undefined') {
                            agentOptions.keepAlive = runtime.keepAlive;
                            if (request.protocol && request.protocol.toLowerCase() === 'https') {
                                options.agent = new https_1.Agent(agentOptions);
                            }
                            else {
                                options.agent = new http_1.Agent(agentOptions);
                            }
                        }
                    }
                    return [4 /*yield*/, httpx.request(url, options)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, new Response(response)];
            }
        });
    });
}
exports.doAction = doAction;
function getValue(type, value) {
    if (typeof type === 'string') {
        // basic type
        return value;
    }
    if (type.type === 'array') {
        if (!Array.isArray(value)) {
            throw new Error("expect: array, actual: ".concat(typeof value));
        }
        return value.map(function (item) {
            return getValue(type.itemType, item);
        });
    }
    if (typeof type === 'function') {
        if (isModelClass(type)) {
            return new type(value);
        }
        return value;
    }
    return value;
}
function toMap(value, withoutStream) {
    if (value === void 0) { value = undefined; }
    if (withoutStream === void 0) { withoutStream = false; }
    if (typeof value === 'undefined' || value == null) {
        return null;
    }
    if (value instanceof Model) {
        return value.toMap(withoutStream);
    }
    // 如果是另一个版本的 tea-typescript 创建的 model，instanceof 会判断不通过
    // 这里做一下处理
    if (typeof value.toMap === 'function') {
        return value.toMap(withoutStream);
    }
    if (Array.isArray(value)) {
        return value.map(function (item) {
            return toMap(item, withoutStream);
        });
    }
    if (withoutStream && (value instanceof stream_1.Readable || value instanceof stream_1.Writable)) {
        return null;
    }
    return value;
}
exports.toMap = toMap;
var Model = /** @class */ (function (_super) {
    __extends(Model, _super);
    function Model(map) {
        var _this = _super.call(this) || this;
        if (map == null) {
            return _this;
        }
        var clz = _this.constructor;
        var names = clz.names();
        var types = clz.types();
        Object.keys(names).forEach((function (name) {
            var value = map[name];
            if (value === undefined || value === null) {
                return;
            }
            var type = types[name];
            _this[name] = getValue(type, value);
        }));
        return _this;
    }
    Model.prototype.validate = function () { };
    Model.prototype.copyWithoutStream = function () {
        var map = this.toMap(true);
        var clz = this.constructor;
        return new clz(map);
    };
    Model.prototype.toMap = function (withoutStream) {
        var _this = this;
        if (withoutStream === void 0) { withoutStream = false; }
        var map = {};
        var clz = this.constructor;
        var names = clz.names();
        Object.keys(names).forEach((function (name) {
            var originName = names[name];
            var value = _this[name];
            if (typeof value === 'undefined' || value == null) {
                return;
            }
            map[originName] = toMap(value, withoutStream);
        }));
        return map;
    };
    Model.validateRequired = function (key, value) {
        if (value === null || typeof value === 'undefined') {
            throw new error_1.BaseError({
                code: 'SDK.ValidateError',
                message: "".concat(key, " is required."),
            });
        }
    };
    Model.validateMaxLength = function (key, value, max) {
        if (value === null || typeof value === 'undefined') {
            return;
        }
        if (value.length > max) {
            throw new error_1.BaseError({
                code: 'SDK.ValidateError',
                message: "".concat(key, " is exceed max-length: ").concat(max, "."),
            });
        }
    };
    Model.validateMinLength = function (key, value, min) {
        if (value === null || typeof value === 'undefined') {
            return;
        }
        if (value.length < min) {
            throw new error_1.BaseError({
                code: 'SDK.ValidateError',
                message: "".concat(key, " is exceed min-length: ").concat(min, "."),
            });
        }
    };
    Model.validateMaximum = function (key, value, max) {
        if (value === null || typeof value === 'undefined') {
            return;
        }
        if (value > max) {
            throw new error_1.BaseError({
                code: 'SDK.ValidateError',
                message: "".concat(key, " cannot be greater than ").concat(max, "."),
            });
        }
    };
    Model.validateMinimum = function (key, value, min) {
        if (value === null || typeof value === 'undefined') {
            return;
        }
        if (value < min) {
            throw new error_1.BaseError({
                code: 'SDK.ValidateError',
                message: "".concat(key, " cannot be less than ").concat(min, "."),
            });
        }
    };
    Model.validatePattern = function (key, value, val) {
        if (value === null || typeof value === 'undefined') {
            return;
        }
        var reg = new RegExp(val);
        if (!reg.test(value)) {
            throw new error_1.BaseError({
                code: 'SDK.ValidateError',
                message: "".concat(key, " is not match ").concat(val, "."),
            });
        }
    };
    Model.validateArray = function (data) {
        if (data === null || typeof data === 'undefined') {
            return;
        }
        data.map(function (ele) {
            if (!ele) {
                return;
            }
            if (ele instanceof Model || typeof ele.validate === 'function') {
                ele.validate();
            }
            else if (Array.isArray(ele)) {
                Model.validateArray(ele);
            }
            else if (ele instanceof Object) {
                Model.validateMap(ele);
            }
        });
    };
    Model.validateMap = function (data) {
        if (data === null || typeof data === 'undefined') {
            return;
        }
        Object.keys(data).map(function (key) {
            var ele = data[key];
            if (!ele) {
                return;
            }
            if (ele instanceof Model || typeof ele.validate === 'function') {
                ele.validate();
            }
            else if (Array.isArray(ele)) {
                Model.validateArray(ele);
            }
            else if (ele instanceof Object) {
                Model.validateMap(ele);
            }
        });
    };
    return Model;
}($tea.Model));
exports.Model = Model;
var FileField = /** @class */ (function (_super) {
    __extends(FileField, _super);
    function FileField(map) {
        return _super.call(this, map) || this;
    }
    FileField.names = function () {
        return {
            filename: 'filename',
            contentType: 'contentType',
            content: 'content',
        };
    };
    FileField.types = function () {
        return {
            filename: 'string',
            contentType: 'string',
            content: 'Readable',
        };
    };
    return FileField;
}(Model));
exports.FileField = FileField;
var ExtendsParameters = /** @class */ (function (_super) {
    __extends(ExtendsParameters, _super);
    function ExtendsParameters(map) {
        return _super.call(this, map) || this;
    }
    ExtendsParameters.names = function () {
        return {
            headers: 'headers',
            queries: 'queries',
        };
    };
    ExtendsParameters.types = function () {
        return {
            headers: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
            queries: { 'type': 'map', 'keyType': 'string', 'valueType': 'string' },
        };
    };
    return ExtendsParameters;
}($tea.Model));
exports.ExtendsParameters = ExtendsParameters;
var RuntimeOptions = /** @class */ (function (_super) {
    __extends(RuntimeOptions, _super);
    function RuntimeOptions(map) {
        return _super.call(this, map) || this;
    }
    RuntimeOptions.names = function () {
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
    };
    RuntimeOptions.types = function () {
        return {
            retryOptions: retry_1.RetryOptions,
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
    };
    return RuntimeOptions;
}($tea.Model));
exports.RuntimeOptions = RuntimeOptions;
function cast(obj, t) {
    if (!obj) {
        throw new Error('can not cast to Map');
    }
    if (typeof obj !== 'object') {
        throw new Error('can not cast to Map');
    }
    var map = obj;
    var clz = t.constructor;
    var names = clz.names();
    var types = clz.types();
    Object.keys(names).forEach(function (key) {
        var originName = names[key];
        var value = map[originName];
        var type = types[key];
        if (typeof value === 'undefined' || value == null) {
            return;
        }
        if (typeof type === 'string') {
            if (type === 'Readable' ||
                type === 'Writable' ||
                type === 'map' ||
                type === 'Buffer' ||
                type === 'any' ||
                typeof value === type) {
                t[key] = value;
                return;
            }
            if (type === 'string' &&
                (typeof value === 'number' ||
                    typeof value === 'boolean')) {
                t[key] = value.toString();
                return;
            }
            if (type === 'boolean') {
                if (value === 1 || value === 0) {
                    t[key] = !!value;
                    return;
                }
                if (value === 'true' || value === 'false') {
                    t[key] = value === 'true';
                    return;
                }
            }
            if (type === 'number' && typeof value === 'string') {
                if (value.match(/^\d*$/)) {
                    t[key] = parseInt(value);
                    return;
                }
                if (value.match(/^[\.\d]*$/)) {
                    t[key] = parseFloat(value);
                    return;
                }
            }
            throw new Error("type of ".concat(key, " is mismatch, expect ").concat(type, ", but ").concat(typeof value));
        }
        else if (type.type === 'map') {
            if (!(value instanceof Object)) {
                throw new Error("type of ".concat(key, " is mismatch, expect object, but ").concat(typeof value));
            }
            t[key] = value;
        }
        else if (type.type === 'array') {
            if (!Array.isArray(value)) {
                throw new Error("type of ".concat(key, " is mismatch, expect array, but ").concat(typeof value));
            }
            if (typeof type.itemType === 'function') {
                t[key] = value.map(function (d) {
                    if (isModelClass(type.itemType)) {
                        return cast(d, new type.itemType({}));
                    }
                    return d;
                });
            }
            else {
                t[key] = value;
            }
        }
        else if (typeof type === 'function') {
            if (!(value instanceof Object)) {
                throw new Error("type of ".concat(key, " is mismatch, expect object, but ").concat(typeof value));
            }
            if (isModelClass(type)) {
                t[key] = cast(value, new type({}));
                return;
            }
            t[key] = value;
        }
        else {
        }
    });
    return t;
}
exports.cast = cast;
function allowRetry(retry, retryTimes, startTime) {
    // 还未重试
    if (retryTimes === 0) {
        return true;
    }
    if (retry.retryable !== true) {
        return false;
    }
    if (retry.policy === 'never') {
        return false;
    }
    if (retry.policy === 'always') {
        return true;
    }
    if (retry.policy === 'simple') {
        return (retryTimes < retry['maxAttempts']);
    }
    if (retry.policy === 'timeout') {
        return Date.now() - startTime < retry.timeout;
    }
    if (retry.maxAttempts && typeof retry.maxAttempts === 'number') {
        return retry.maxAttempts >= retryTimes;
    }
    // 默认不重试
    return false;
}
exports.allowRetry = allowRetry;
function getBackoffTime(backoff, retryTimes) {
    if (retryTimes === 0) {
        // 首次调用，不使用退避策略
        return 0;
    }
    if (backoff.policy === 'no') {
        // 不退避
        return 0;
    }
    if (backoff.policy === 'fixed') {
        // 固定退避
        return backoff.period;
    }
    if (backoff.policy === 'random') {
        // 随机退避
        var min = backoff['minPeriod'];
        var max = backoff['maxPeriod'];
        return min + (max - min) * Math.random();
    }
    if (backoff.policy === 'exponential') {
        // 指数退避
        var init = backoff.initial;
        var multiplier = backoff.multiplier;
        var time = init * Math.pow(1 + multiplier, retryTimes - 1);
        var max = backoff.max;
        return Math.min(time, max);
    }
    if (backoff.policy === 'exponential_random') {
        // 指数随机退避
        var init = backoff.initial;
        var multiplier = backoff.multiplier;
        var time = init * Math.pow(1 + multiplier, retryTimes - 1);
        var max = backoff.max;
        return Math.min(time * (0.5 + Math.random()), max);
    }
    return 0;
}
exports.getBackoffTime = getBackoffTime;
function isRetryable(err) {
    if (typeof err === 'undefined' || err === null) {
        return false;
    }
    return err.name === 'RetryError';
}
exports.isRetryable = isRetryable;
//# sourceMappingURL=core.js.map