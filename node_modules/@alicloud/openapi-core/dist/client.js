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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This file is auto-generated, don't edit it
const $dara = __importStar(require("@darabonba/typescript"));
const utils_1 = __importDefault(require("./utils"));
const credentials_1 = __importStar(require("@alicloud/credentials")), $Credential = credentials_1;
const $SPI = __importStar(require("@alicloud/gateway-spi"));
exports.$OpenApiUtil = __importStar(require("./utils"));
var utils_2 = require("./utils");
Object.defineProperty(exports, "OpenApiUtil", { enumerable: true, get: function () { return utils_2.default; } });
const $_error = __importStar(require("./exceptions/error"));
__exportStar(require("./exceptions/error"), exports);
const $_model = __importStar(require("./models/model"));
__exportStar(require("./models/model"), exports);
class Client {
    /**
     * @remarks
     * Init client with Config
     *
     * @param config - config contains the necessary information to create a client
     */
    constructor(config) {
        if ($dara.isNull(config)) {
            throw new $_error.ClientError({
                code: "ParameterMissing",
                message: "'config' can not be unset",
            });
        }
        if ((!$dara.isNull(config.accessKeyId) && config.accessKeyId != "") && (!$dara.isNull(config.accessKeySecret) && config.accessKeySecret != "")) {
            if (!$dara.isNull(config.securityToken) && config.securityToken != "") {
                config.type = "sts";
            }
            else {
                config.type = "access_key";
            }
            let credentialConfig = new $Credential.Config({
                accessKeyId: config.accessKeyId,
                type: config.type,
                accessKeySecret: config.accessKeySecret,
            });
            credentialConfig.securityToken = config.securityToken;
            this._credential = new credentials_1.default(credentialConfig);
        }
        else if (!$dara.isNull(config.bearerToken) && config.bearerToken != "") {
            let cc = new $Credential.Config({
                type: "bearer",
                bearerToken: config.bearerToken,
            });
            this._credential = new credentials_1.default(cc);
        }
        else if (!$dara.isNull(config.credential)) {
            this._credential = config.credential;
        }
        this._endpoint = config.endpoint;
        this._endpointType = config.endpointType;
        this._network = config.network;
        this._suffix = config.suffix;
        this._protocol = config.protocol;
        this._method = config.method;
        this._regionId = config.regionId;
        this._userAgent = config.userAgent;
        this._readTimeout = config.readTimeout;
        this._connectTimeout = config.connectTimeout;
        this._httpProxy = config.httpProxy;
        this._httpsProxy = config.httpsProxy;
        this._noProxy = config.noProxy;
        this._socks5Proxy = config.socks5Proxy;
        this._socks5NetWork = config.socks5NetWork;
        this._maxIdleConns = config.maxIdleConns;
        this._signatureVersion = config.signatureVersion;
        this._signatureAlgorithm = config.signatureAlgorithm;
        this._globalParameters = config.globalParameters;
        this._key = config.key;
        this._cert = config.cert;
        this._ca = config.ca;
        this._disableHttp2 = config.disableHttp2;
        this._retryOptions = config.retryOptions;
        this._tlsMinVersion = config.tlsMinVersion;
    }
    /**
     * @remarks
     * Encapsulate the request and invoke the network
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    async doRPCRequest(action, version, protocol, method, authType, bodyType, request, runtime) {
        let _runtime = {
            key: runtime.key || this._key,
            cert: runtime.cert || this._cert,
            ca: runtime.ca || this._ca,
            readTimeout: runtime.readTimeout || this._readTimeout,
            connectTimeout: runtime.connectTimeout || this._connectTimeout,
            httpProxy: runtime.httpProxy || this._httpProxy,
            httpsProxy: runtime.httpsProxy || this._httpsProxy,
            noProxy: runtime.noProxy || this._noProxy,
            socks5Proxy: runtime.socks5Proxy || this._socks5Proxy,
            socks5NetWork: runtime.socks5NetWork || this._socks5NetWork,
            maxIdleConns: runtime.maxIdleConns || this._maxIdleConns,
            retryOptions: this._retryOptions,
            ignoreSSL: runtime.ignoreSSL,
            tlsMinVersion: this._tlsMinVersion,
        };
        let _retriesAttempted = 0;
        let _lastRequest = null, _lastResponse = null;
        let _context = new $dara.RetryPolicyContext({
            retriesAttempted: _retriesAttempted,
        });
        while ($dara.shouldRetry(_runtime['retryOptions'], _context)) {
            if (_retriesAttempted > 0) {
                let _backoffTime = $dara.getBackoffDelay(_runtime['retryOptions'], _context);
                if (_backoffTime > 0) {
                    await $dara.sleep(_backoffTime);
                }
            }
            _retriesAttempted = _retriesAttempted + 1;
            try {
                let request_ = new $dara.Request();
                request_.protocol = this._protocol || protocol;
                request_.method = method;
                request_.pathname = "/";
                let globalQueries = {};
                let globalHeaders = {};
                if (!$dara.isNull(this._globalParameters)) {
                    let globalParams = this._globalParameters;
                    if (!$dara.isNull(globalParams.queries)) {
                        globalQueries = globalParams.queries;
                    }
                    if (!$dara.isNull(globalParams.headers)) {
                        globalHeaders = globalParams.headers;
                    }
                }
                let extendsHeaders = {};
                let extendsQueries = {};
                if (!$dara.isNull(runtime.extendsParameters)) {
                    let extendsParameters = runtime.extendsParameters;
                    if (!$dara.isNull(extendsParameters.headers)) {
                        extendsHeaders = extendsParameters.headers;
                    }
                    if (!$dara.isNull(extendsParameters.queries)) {
                        extendsQueries = extendsParameters.queries;
                    }
                }
                request_.query = Object.assign(Object.assign(Object.assign({ Action: action, Format: "json", Version: version, Timestamp: utils_1.default.getTimestamp(), SignatureNonce: utils_1.default.getNonce() }, globalQueries), extendsQueries), request.query);
                let headers = this.getRpcHeaders();
                if ($dara.isNull(headers)) {
                    // endpoint is setted in product client
                    request_.headers = Object.assign(Object.assign(Object.assign({ host: this._endpoint, 'x-acs-version': version, 'x-acs-action': action, 'user-agent': utils_1.default.getUserAgent(this._userAgent) }, globalHeaders), extendsHeaders), request.headers);
                }
                else {
                    request_.headers = Object.assign(Object.assign(Object.assign(Object.assign({ host: this._endpoint, 'x-acs-version': version, 'x-acs-action': action, 'user-agent': utils_1.default.getUserAgent(this._userAgent) }, globalHeaders), extendsHeaders), request.headers), headers);
                }
                if (!$dara.isNull(request.body)) {
                    let m = request.body;
                    let tmp = utils_1.default.query(m);
                    request_.body = new $dara.BytesReadable($dara.Form.toFormString(tmp));
                    request_.headers["content-type"] = "application/x-www-form-urlencoded";
                }
                if (authType != "Anonymous") {
                    if ($dara.isNull(this._credential)) {
                        throw new $_error.ClientError({
                            code: `InvalidCredentials`,
                            message: `Please set up the credentials correctly. If you are setting them through environment variables, please ensure that ALIBABA_CLOUD_ACCESS_KEY_ID and ALIBABA_CLOUD_ACCESS_KEY_SECRET are set correctly. See https://help.aliyun.com/zh/sdk/developer-reference/configure-the-alibaba-cloud-accesskey-environment-variable-on-linux-macos-and-windows-systems for more details.`,
                        });
                    }
                    let credentialModel = await this._credential.getCredential();
                    if (!$dara.isNull(credentialModel.providerName)) {
                        request_.headers["x-acs-credentials-provider"] = credentialModel.providerName;
                    }
                    let credentialType = credentialModel.type;
                    if (credentialType == "bearer") {
                        let bearerToken = credentialModel.bearerToken;
                        request_.query["BearerToken"] = bearerToken;
                        request_.query["SignatureType"] = "BEARERTOKEN";
                    }
                    else if (credentialType == "id_token") {
                        let idToken = credentialModel.securityToken;
                        request_.headers["x-acs-zero-trust-idtoken"] = idToken;
                    }
                    else {
                        let accessKeyId = credentialModel.accessKeyId;
                        let accessKeySecret = credentialModel.accessKeySecret;
                        let securityToken = credentialModel.securityToken;
                        if (!$dara.isNull(securityToken) && securityToken != "") {
                            request_.query["SecurityToken"] = securityToken;
                        }
                        request_.query["SignatureMethod"] = "HMAC-SHA1";
                        request_.query["SignatureVersion"] = "1.0";
                        request_.query["AccessKeyId"] = accessKeyId;
                        let t = null;
                        if (!$dara.isNull(request.body)) {
                            t = request.body;
                        }
                        let signedParam = Object.assign(Object.assign({}, request_.query), utils_1.default.query(t));
                        request_.query["Signature"] = utils_1.default.getRPCSignature(signedParam, request_.method, accessKeySecret);
                    }
                }
                _lastRequest = request_;
                let response_ = await $dara.doAction(request_, _runtime);
                _lastResponse = response_;
                if ((response_.statusCode >= 400) && (response_.statusCode < 600)) {
                    let _res = await $dara.Stream.readAsJSON(response_.body);
                    let err = _res;
                    let requestId = err["RequestId"] || err["requestId"];
                    let code = err["Code"] || err["code"];
                    if ((`${code}` == "Throttling") || (`${code}` == "Throttling.User") || (`${code}` == "Throttling.Api")) {
                        throw new $_error.ThrottlingError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            retryAfter: utils_1.default.getThrottlingTimeLeft(response_.headers),
                            data: err,
                            requestId: `${requestId}`,
                        });
                    }
                    else if ((response_.statusCode >= 400) && (response_.statusCode < 500)) {
                        throw new $_error.ClientError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            data: err,
                            accessDeniedDetail: this.getAccessDeniedDetail(err),
                            requestId: `${requestId}`,
                        });
                    }
                    else {
                        throw new $_error.ServerError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            data: err,
                            requestId: `${requestId}`,
                        });
                    }
                }
                if (bodyType == "binary") {
                    let resp = {
                        body: response_.body,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                    return resp;
                }
                else if (bodyType == "byte") {
                    let byt = await $dara.Stream.readAsBytes(response_.body);
                    return {
                        body: byt,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (bodyType == "string") {
                    let _str = await $dara.Stream.readAsString(response_.body);
                    return {
                        body: _str,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (bodyType == "json") {
                    let obj = await $dara.Stream.readAsJSON(response_.body);
                    let res = obj;
                    return {
                        body: res,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (bodyType == "array") {
                    let arr = await $dara.Stream.readAsJSON(response_.body);
                    return {
                        body: arr,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else {
                    return {
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
            }
            catch (ex) {
                _context = new $dara.RetryPolicyContext({
                    retriesAttempted: _retriesAttempted,
                    httpRequest: _lastRequest,
                    httpResponse: _lastResponse,
                    exception: ex,
                });
                continue;
            }
        }
        throw $dara.newUnretryableError(_context);
    }
    /**
     * @remarks
     * Encapsulate the request and invoke the network
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param pathname - pathname of every api
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    async doROARequest(action, version, protocol, method, authType, pathname, bodyType, request, runtime) {
        let _runtime = {
            key: runtime.key || this._key,
            cert: runtime.cert || this._cert,
            ca: runtime.ca || this._ca,
            readTimeout: runtime.readTimeout || this._readTimeout,
            connectTimeout: runtime.connectTimeout || this._connectTimeout,
            httpProxy: runtime.httpProxy || this._httpProxy,
            httpsProxy: runtime.httpsProxy || this._httpsProxy,
            noProxy: runtime.noProxy || this._noProxy,
            socks5Proxy: runtime.socks5Proxy || this._socks5Proxy,
            socks5NetWork: runtime.socks5NetWork || this._socks5NetWork,
            maxIdleConns: runtime.maxIdleConns || this._maxIdleConns,
            retryOptions: this._retryOptions,
            ignoreSSL: runtime.ignoreSSL,
            tlsMinVersion: this._tlsMinVersion,
        };
        let _retriesAttempted = 0;
        let _lastRequest = null, _lastResponse = null;
        let _context = new $dara.RetryPolicyContext({
            retriesAttempted: _retriesAttempted,
        });
        while ($dara.shouldRetry(_runtime['retryOptions'], _context)) {
            if (_retriesAttempted > 0) {
                let _backoffTime = $dara.getBackoffDelay(_runtime['retryOptions'], _context);
                if (_backoffTime > 0) {
                    await $dara.sleep(_backoffTime);
                }
            }
            _retriesAttempted = _retriesAttempted + 1;
            try {
                let request_ = new $dara.Request();
                request_.protocol = this._protocol || protocol;
                request_.method = method;
                request_.pathname = pathname;
                let globalQueries = {};
                let globalHeaders = {};
                if (!$dara.isNull(this._globalParameters)) {
                    let globalParams = this._globalParameters;
                    if (!$dara.isNull(globalParams.queries)) {
                        globalQueries = globalParams.queries;
                    }
                    if (!$dara.isNull(globalParams.headers)) {
                        globalHeaders = globalParams.headers;
                    }
                }
                let extendsHeaders = {};
                let extendsQueries = {};
                if (!$dara.isNull(runtime.extendsParameters)) {
                    let extendsParameters = runtime.extendsParameters;
                    if (!$dara.isNull(extendsParameters.headers)) {
                        extendsHeaders = extendsParameters.headers;
                    }
                    if (!$dara.isNull(extendsParameters.queries)) {
                        extendsQueries = extendsParameters.queries;
                    }
                }
                request_.headers = Object.assign(Object.assign(Object.assign({ date: utils_1.default.getDateUTCString(), host: this._endpoint, accept: "application/json", 'x-acs-signature-nonce': utils_1.default.getNonce(), 'x-acs-signature-method': "HMAC-SHA1", 'x-acs-signature-version': "1.0", 'x-acs-version': version, 'x-acs-action': action, 'user-agent': utils_1.default.getUserAgent(this._userAgent) }, globalHeaders), extendsHeaders), request.headers);
                if (!$dara.isNull(request.body)) {
                    request_.body = new $dara.BytesReadable(typeof request.body === "string" ? request.body : JSON.stringify(request.body));
                    request_.headers["content-type"] = "application/json; charset=utf-8";
                }
                request_.query = Object.assign(Object.assign({}, globalQueries), extendsQueries);
                if (!$dara.isNull(request.query)) {
                    request_.query = Object.assign(Object.assign({}, request_.query), request.query);
                }
                if (authType != "Anonymous") {
                    if ($dara.isNull(this._credential)) {
                        throw new $_error.ClientError({
                            code: `InvalidCredentials`,
                            message: `Please set up the credentials correctly. If you are setting them through environment variables, please ensure that ALIBABA_CLOUD_ACCESS_KEY_ID and ALIBABA_CLOUD_ACCESS_KEY_SECRET are set correctly. See https://help.aliyun.com/zh/sdk/developer-reference/configure-the-alibaba-cloud-accesskey-environment-variable-on-linux-macos-and-windows-systems for more details.`,
                        });
                    }
                    let credentialModel = await this._credential.getCredential();
                    if (!$dara.isNull(credentialModel.providerName)) {
                        request_.headers["x-acs-credentials-provider"] = credentialModel.providerName;
                    }
                    let credentialType = credentialModel.type;
                    if (credentialType == "bearer") {
                        let bearerToken = credentialModel.bearerToken;
                        request_.headers["x-acs-bearer-token"] = bearerToken;
                        request_.headers["x-acs-signature-type"] = "BEARERTOKEN";
                    }
                    else if (credentialType == "id_token") {
                        let idToken = credentialModel.securityToken;
                        request_.headers["x-acs-zero-trust-idtoken"] = idToken;
                    }
                    else {
                        let accessKeyId = credentialModel.accessKeyId;
                        let accessKeySecret = credentialModel.accessKeySecret;
                        let securityToken = credentialModel.securityToken;
                        if (!$dara.isNull(securityToken) && securityToken != "") {
                            request_.headers["x-acs-accesskey-id"] = accessKeyId;
                            request_.headers["x-acs-security-token"] = securityToken;
                        }
                        let stringToSign = utils_1.default.getStringToSign(request_);
                        request_.headers["authorization"] = `acs ${accessKeyId}:${utils_1.default.getROASignature(stringToSign, accessKeySecret)}`;
                    }
                }
                _lastRequest = request_;
                let response_ = await $dara.doAction(request_, _runtime);
                _lastResponse = response_;
                if (response_.statusCode == 204) {
                    return {
                        headers: response_.headers,
                    };
                }
                if ((response_.statusCode >= 400) && (response_.statusCode < 600)) {
                    let _res = await $dara.Stream.readAsJSON(response_.body);
                    let err = _res;
                    let requestId = err["RequestId"] || err["requestId"];
                    requestId = requestId || err["requestid"];
                    let code = err["Code"] || err["code"];
                    if ((`${code}` == "Throttling") || (`${code}` == "Throttling.User") || (`${code}` == "Throttling.Api")) {
                        throw new $_error.ThrottlingError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            retryAfter: utils_1.default.getThrottlingTimeLeft(response_.headers),
                            data: err,
                            requestId: `${requestId}`,
                        });
                    }
                    else if ((response_.statusCode >= 400) && (response_.statusCode < 500)) {
                        throw new $_error.ClientError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            data: err,
                            accessDeniedDetail: this.getAccessDeniedDetail(err),
                            requestId: `${requestId}`,
                        });
                    }
                    else {
                        throw new $_error.ServerError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            data: err,
                            requestId: `${requestId}`,
                        });
                    }
                }
                if (bodyType == "binary") {
                    let resp = {
                        body: response_.body,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                    return resp;
                }
                else if (bodyType == "byte") {
                    let byt = await $dara.Stream.readAsBytes(response_.body);
                    return {
                        body: byt,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (bodyType == "string") {
                    let _str = await $dara.Stream.readAsString(response_.body);
                    return {
                        body: _str,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (bodyType == "json") {
                    let obj = await $dara.Stream.readAsJSON(response_.body);
                    let res = obj;
                    return {
                        body: res,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (bodyType == "array") {
                    let arr = await $dara.Stream.readAsJSON(response_.body);
                    return {
                        body: arr,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else {
                    return {
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
            }
            catch (ex) {
                _context = new $dara.RetryPolicyContext({
                    retriesAttempted: _retriesAttempted,
                    httpRequest: _lastRequest,
                    httpResponse: _lastResponse,
                    exception: ex,
                });
                continue;
            }
        }
        throw $dara.newUnretryableError(_context);
    }
    /**
     * @remarks
     * Encapsulate the request and invoke the network with form body
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param pathname - pathname of every api
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    async doROARequestWithForm(action, version, protocol, method, authType, pathname, bodyType, request, runtime) {
        let _runtime = {
            key: runtime.key || this._key,
            cert: runtime.cert || this._cert,
            ca: runtime.ca || this._ca,
            readTimeout: runtime.readTimeout || this._readTimeout,
            connectTimeout: runtime.connectTimeout || this._connectTimeout,
            httpProxy: runtime.httpProxy || this._httpProxy,
            httpsProxy: runtime.httpsProxy || this._httpsProxy,
            noProxy: runtime.noProxy || this._noProxy,
            socks5Proxy: runtime.socks5Proxy || this._socks5Proxy,
            socks5NetWork: runtime.socks5NetWork || this._socks5NetWork,
            maxIdleConns: runtime.maxIdleConns || this._maxIdleConns,
            retryOptions: this._retryOptions,
            ignoreSSL: runtime.ignoreSSL,
            tlsMinVersion: this._tlsMinVersion,
        };
        let _retriesAttempted = 0;
        let _lastRequest = null, _lastResponse = null;
        let _context = new $dara.RetryPolicyContext({
            retriesAttempted: _retriesAttempted,
        });
        while ($dara.shouldRetry(_runtime['retryOptions'], _context)) {
            if (_retriesAttempted > 0) {
                let _backoffTime = $dara.getBackoffDelay(_runtime['retryOptions'], _context);
                if (_backoffTime > 0) {
                    await $dara.sleep(_backoffTime);
                }
            }
            _retriesAttempted = _retriesAttempted + 1;
            try {
                let request_ = new $dara.Request();
                request_.protocol = this._protocol || protocol;
                request_.method = method;
                request_.pathname = pathname;
                let globalQueries = {};
                let globalHeaders = {};
                if (!$dara.isNull(this._globalParameters)) {
                    let globalParams = this._globalParameters;
                    if (!$dara.isNull(globalParams.queries)) {
                        globalQueries = globalParams.queries;
                    }
                    if (!$dara.isNull(globalParams.headers)) {
                        globalHeaders = globalParams.headers;
                    }
                }
                let extendsHeaders = {};
                let extendsQueries = {};
                if (!$dara.isNull(runtime.extendsParameters)) {
                    let extendsParameters = runtime.extendsParameters;
                    if (!$dara.isNull(extendsParameters.headers)) {
                        extendsHeaders = extendsParameters.headers;
                    }
                    if (!$dara.isNull(extendsParameters.queries)) {
                        extendsQueries = extendsParameters.queries;
                    }
                }
                request_.headers = Object.assign(Object.assign(Object.assign({ date: utils_1.default.getDateUTCString(), host: this._endpoint, accept: "application/json", 'x-acs-signature-nonce': utils_1.default.getNonce(), 'x-acs-signature-method': "HMAC-SHA1", 'x-acs-signature-version': "1.0", 'x-acs-version': version, 'x-acs-action': action, 'user-agent': utils_1.default.getUserAgent(this._userAgent) }, globalHeaders), extendsHeaders), request.headers);
                if (!$dara.isNull(request.body)) {
                    let m = request.body;
                    request_.body = new $dara.BytesReadable(utils_1.default.toForm(m));
                    request_.headers["content-type"] = "application/x-www-form-urlencoded";
                }
                request_.query = Object.assign(Object.assign({}, globalQueries), extendsQueries);
                if (!$dara.isNull(request.query)) {
                    request_.query = Object.assign(Object.assign({}, request_.query), request.query);
                }
                if (authType != "Anonymous") {
                    if ($dara.isNull(this._credential)) {
                        throw new $_error.ClientError({
                            code: `InvalidCredentials`,
                            message: `Please set up the credentials correctly. If you are setting them through environment variables, please ensure that ALIBABA_CLOUD_ACCESS_KEY_ID and ALIBABA_CLOUD_ACCESS_KEY_SECRET are set correctly. See https://help.aliyun.com/zh/sdk/developer-reference/configure-the-alibaba-cloud-accesskey-environment-variable-on-linux-macos-and-windows-systems for more details.`,
                        });
                    }
                    let credentialModel = await this._credential.getCredential();
                    if (!$dara.isNull(credentialModel.providerName)) {
                        request_.headers["x-acs-credentials-provider"] = credentialModel.providerName;
                    }
                    let credentialType = credentialModel.type;
                    if (credentialType == "bearer") {
                        let bearerToken = credentialModel.bearerToken;
                        request_.headers["x-acs-bearer-token"] = bearerToken;
                        request_.headers["x-acs-signature-type"] = "BEARERTOKEN";
                    }
                    else if (credentialType == "id_token") {
                        let idToken = credentialModel.securityToken;
                        request_.headers["x-acs-zero-trust-idtoken"] = idToken;
                    }
                    else {
                        let accessKeyId = credentialModel.accessKeyId;
                        let accessKeySecret = credentialModel.accessKeySecret;
                        let securityToken = credentialModel.securityToken;
                        if (!$dara.isNull(securityToken) && securityToken != "") {
                            request_.headers["x-acs-accesskey-id"] = accessKeyId;
                            request_.headers["x-acs-security-token"] = securityToken;
                        }
                        let stringToSign = utils_1.default.getStringToSign(request_);
                        request_.headers["authorization"] = `acs ${accessKeyId}:${utils_1.default.getROASignature(stringToSign, accessKeySecret)}`;
                    }
                }
                _lastRequest = request_;
                let response_ = await $dara.doAction(request_, _runtime);
                _lastResponse = response_;
                if (response_.statusCode == 204) {
                    return {
                        headers: response_.headers,
                    };
                }
                if ((response_.statusCode >= 400) && (response_.statusCode < 600)) {
                    let _res = await $dara.Stream.readAsJSON(response_.body);
                    let err = _res;
                    let requestId = err["RequestId"] || err["requestId"];
                    let code = err["Code"] || err["code"];
                    if ((`${code}` == "Throttling") || (`${code}` == "Throttling.User") || (`${code}` == "Throttling.Api")) {
                        throw new $_error.ThrottlingError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            retryAfter: utils_1.default.getThrottlingTimeLeft(response_.headers),
                            data: err,
                            requestId: `${requestId}`,
                        });
                    }
                    else if ((response_.statusCode >= 400) && (response_.statusCode < 500)) {
                        throw new $_error.ClientError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            data: err,
                            accessDeniedDetail: this.getAccessDeniedDetail(err),
                            requestId: `${requestId}`,
                        });
                    }
                    else {
                        throw new $_error.ServerError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            data: err,
                            requestId: `${requestId}`,
                        });
                    }
                }
                if (bodyType == "binary") {
                    let resp = {
                        body: response_.body,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                    return resp;
                }
                else if (bodyType == "byte") {
                    let byt = await $dara.Stream.readAsBytes(response_.body);
                    return {
                        body: byt,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (bodyType == "string") {
                    let _str = await $dara.Stream.readAsString(response_.body);
                    return {
                        body: _str,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (bodyType == "json") {
                    let obj = await $dara.Stream.readAsJSON(response_.body);
                    let res = obj;
                    return {
                        body: res,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (bodyType == "array") {
                    let arr = await $dara.Stream.readAsJSON(response_.body);
                    return {
                        body: arr,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else {
                    return {
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
            }
            catch (ex) {
                _context = new $dara.RetryPolicyContext({
                    retriesAttempted: _retriesAttempted,
                    httpRequest: _lastRequest,
                    httpResponse: _lastResponse,
                    exception: ex,
                });
                continue;
            }
        }
        throw $dara.newUnretryableError(_context);
    }
    /**
     * @remarks
     * Encapsulate the request and invoke the network
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    async doRequest(params, request, runtime) {
        let _runtime = {
            key: runtime.key || this._key,
            cert: runtime.cert || this._cert,
            ca: runtime.ca || this._ca,
            readTimeout: runtime.readTimeout || this._readTimeout,
            connectTimeout: runtime.connectTimeout || this._connectTimeout,
            httpProxy: runtime.httpProxy || this._httpProxy,
            httpsProxy: runtime.httpsProxy || this._httpsProxy,
            noProxy: runtime.noProxy || this._noProxy,
            socks5Proxy: runtime.socks5Proxy || this._socks5Proxy,
            socks5NetWork: runtime.socks5NetWork || this._socks5NetWork,
            maxIdleConns: runtime.maxIdleConns || this._maxIdleConns,
            retryOptions: this._retryOptions,
            ignoreSSL: runtime.ignoreSSL,
            tlsMinVersion: this._tlsMinVersion,
        };
        let _retriesAttempted = 0;
        let _lastRequest = null, _lastResponse = null;
        let _context = new $dara.RetryPolicyContext({
            retriesAttempted: _retriesAttempted,
        });
        while ($dara.shouldRetry(_runtime['retryOptions'], _context)) {
            if (_retriesAttempted > 0) {
                let _backoffTime = $dara.getBackoffDelay(_runtime['retryOptions'], _context);
                if (_backoffTime > 0) {
                    await $dara.sleep(_backoffTime);
                }
            }
            _retriesAttempted = _retriesAttempted + 1;
            try {
                let request_ = new $dara.Request();
                request_.protocol = this._protocol || params.protocol;
                request_.method = params.method;
                request_.pathname = params.pathname;
                let globalQueries = {};
                let globalHeaders = {};
                if (!$dara.isNull(this._globalParameters)) {
                    let globalParams = this._globalParameters;
                    if (!$dara.isNull(globalParams.queries)) {
                        globalQueries = globalParams.queries;
                    }
                    if (!$dara.isNull(globalParams.headers)) {
                        globalHeaders = globalParams.headers;
                    }
                }
                let extendsHeaders = {};
                let extendsQueries = {};
                if (!$dara.isNull(runtime.extendsParameters)) {
                    let extendsParameters = runtime.extendsParameters;
                    if (!$dara.isNull(extendsParameters.headers)) {
                        extendsHeaders = extendsParameters.headers;
                    }
                    if (!$dara.isNull(extendsParameters.queries)) {
                        extendsQueries = extendsParameters.queries;
                    }
                }
                request_.query = Object.assign(Object.assign(Object.assign({}, globalQueries), extendsQueries), request.query);
                // endpoint is setted in product client
                request_.headers = Object.assign(Object.assign(Object.assign({ host: this._endpoint, 'x-acs-version': params.version, 'x-acs-action': params.action, 'user-agent': utils_1.default.getUserAgent(this._userAgent), 'x-acs-date': utils_1.default.getTimestamp(), 'x-acs-signature-nonce': utils_1.default.getNonce(), accept: "application/json" }, globalHeaders), extendsHeaders), request.headers);
                if (params.style == "RPC") {
                    let headers = this.getRpcHeaders();
                    if (!$dara.isNull(headers)) {
                        request_.headers = Object.assign(Object.assign({}, request_.headers), headers);
                    }
                }
                let signatureAlgorithm = this._signatureAlgorithm || "ACS3-HMAC-SHA256";
                let hashedRequestPayload = utils_1.default.hash(Buffer.from("", "utf-8"), signatureAlgorithm);
                if (!$dara.isNull(request.stream)) {
                    let tmp = await $dara.Stream.readAsBytes(request.stream);
                    hashedRequestPayload = utils_1.default.hash(tmp, signatureAlgorithm);
                    request_.body = new $dara.BytesReadable(tmp);
                    request_.headers["content-type"] = "application/octet-stream";
                }
                else {
                    if (!$dara.isNull(request.body)) {
                        if (params.reqBodyType == "byte") {
                            let byteObj = Buffer.from(request.body);
                            hashedRequestPayload = utils_1.default.hash(byteObj, signatureAlgorithm);
                            request_.body = new $dara.BytesReadable(byteObj);
                        }
                        else if (params.reqBodyType == "json") {
                            let jsonObj = typeof request.body === "string" ? request.body : JSON.stringify(request.body);
                            hashedRequestPayload = utils_1.default.hash(Buffer.from(jsonObj, "utf8"), signatureAlgorithm);
                            request_.body = new $dara.BytesReadable(jsonObj);
                            request_.headers["content-type"] = "application/json; charset=utf-8";
                        }
                        else {
                            let m = request.body;
                            let formObj = utils_1.default.toForm(m);
                            hashedRequestPayload = utils_1.default.hash(Buffer.from(formObj, "utf8"), signatureAlgorithm);
                            request_.body = new $dara.BytesReadable(formObj);
                            request_.headers["content-type"] = "application/x-www-form-urlencoded";
                        }
                    }
                }
                request_.headers["x-acs-content-sha256"] = hashedRequestPayload.toString("hex");
                if (params.authType != "Anonymous") {
                    if ($dara.isNull(this._credential)) {
                        throw new $_error.ClientError({
                            code: `InvalidCredentials`,
                            message: `Please set up the credentials correctly. If you are setting them through environment variables, please ensure that ALIBABA_CLOUD_ACCESS_KEY_ID and ALIBABA_CLOUD_ACCESS_KEY_SECRET are set correctly. See https://help.aliyun.com/zh/sdk/developer-reference/configure-the-alibaba-cloud-accesskey-environment-variable-on-linux-macos-and-windows-systems for more details.`,
                        });
                    }
                    let credentialModel = await this._credential.getCredential();
                    if (!$dara.isNull(credentialModel.providerName)) {
                        request_.headers["x-acs-credentials-provider"] = credentialModel.providerName;
                    }
                    let authType = credentialModel.type;
                    if (authType == "bearer") {
                        let bearerToken = credentialModel.bearerToken;
                        request_.headers["x-acs-bearer-token"] = bearerToken;
                        if (params.style == "RPC") {
                            request_.query["SignatureType"] = "BEARERTOKEN";
                        }
                        else {
                            request_.headers["x-acs-signature-type"] = "BEARERTOKEN";
                        }
                    }
                    else if (authType == "id_token") {
                        let idToken = credentialModel.securityToken;
                        request_.headers["x-acs-zero-trust-idtoken"] = idToken;
                    }
                    else {
                        let accessKeyId = credentialModel.accessKeyId;
                        let accessKeySecret = credentialModel.accessKeySecret;
                        let securityToken = credentialModel.securityToken;
                        if (!$dara.isNull(securityToken) && securityToken != "") {
                            request_.headers["x-acs-accesskey-id"] = accessKeyId;
                            request_.headers["x-acs-security-token"] = securityToken;
                        }
                        request_.headers["Authorization"] = utils_1.default.getAuthorization(request_, signatureAlgorithm, hashedRequestPayload.toString("hex"), accessKeyId, accessKeySecret);
                    }
                }
                _lastRequest = request_;
                let response_ = await $dara.doAction(request_, _runtime);
                _lastResponse = response_;
                if ((response_.statusCode >= 400) && (response_.statusCode < 600)) {
                    let err = {};
                    if (!$dara.isNull(response_.headers["content-type"]) && response_.headers["content-type"] == "text/xml;charset=utf-8") {
                        let _str = await $dara.Stream.readAsString(response_.body);
                        let respMap = $dara.XML.parseXml(_str, null);
                        err = respMap["Error"];
                    }
                    else {
                        let _res = await $dara.Stream.readAsJSON(response_.body);
                        err = _res;
                    }
                    let requestId = err["RequestId"] || err["requestId"];
                    let code = err["Code"] || err["code"];
                    if ((`${code}` == "Throttling") || (`${code}` == "Throttling.User") || (`${code}` == "Throttling.Api")) {
                        throw new $_error.ThrottlingError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            retryAfter: utils_1.default.getThrottlingTimeLeft(response_.headers),
                            data: err,
                            requestId: `${requestId}`,
                        });
                    }
                    else if ((response_.statusCode >= 400) && (response_.statusCode < 500)) {
                        throw new $_error.ClientError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            data: err,
                            accessDeniedDetail: this.getAccessDeniedDetail(err),
                            requestId: `${requestId}`,
                        });
                    }
                    else {
                        throw new $_error.ServerError({
                            statusCode: response_.statusCode,
                            code: `${code}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${requestId}`,
                            description: `${err["Description"] || err["description"]}`,
                            data: err,
                            requestId: `${requestId}`,
                        });
                    }
                }
                if (params.bodyType == "binary") {
                    let resp = {
                        body: response_.body,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                    return resp;
                }
                else if (params.bodyType == "byte") {
                    let byt = await $dara.Stream.readAsBytes(response_.body);
                    return {
                        body: byt,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (params.bodyType == "string") {
                    let respStr = await $dara.Stream.readAsString(response_.body);
                    return {
                        body: respStr,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (params.bodyType == "json") {
                    let obj = await $dara.Stream.readAsJSON(response_.body);
                    let res = obj;
                    return {
                        body: res,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else if (params.bodyType == "array") {
                    let arr = await $dara.Stream.readAsJSON(response_.body);
                    return {
                        body: arr,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
                else {
                    let anything = await $dara.Stream.readAsString(response_.body);
                    return {
                        body: anything,
                        headers: response_.headers,
                        statusCode: response_.statusCode,
                    };
                }
            }
            catch (ex) {
                _context = new $dara.RetryPolicyContext({
                    retriesAttempted: _retriesAttempted,
                    httpRequest: _lastRequest,
                    httpResponse: _lastResponse,
                    exception: ex,
                });
                continue;
            }
        }
        throw $dara.newUnretryableError(_context);
    }
    /**
     * @remarks
     * Encapsulate the request and invoke the network
     *
     * @param action - api name
     * @param version - product version
     * @param protocol - http or https
     * @param method - e.g. GET
     * @param authType - authorization type e.g. AK
     * @param bodyType - response body type e.g. String
     * @param request - object of OpenApiRequest
     * @param runtime - which controls some details of call api, such as retry times
     * @returns the response
     */
    async execute(params, request, runtime) {
        let _runtime = {
            key: runtime.key || this._key,
            cert: runtime.cert || this._cert,
            ca: runtime.ca || this._ca,
            readTimeout: runtime.readTimeout || this._readTimeout,
            connectTimeout: runtime.connectTimeout || this._connectTimeout,
            httpProxy: runtime.httpProxy || this._httpProxy,
            httpsProxy: runtime.httpsProxy || this._httpsProxy,
            noProxy: runtime.noProxy || this._noProxy,
            socks5Proxy: runtime.socks5Proxy || this._socks5Proxy,
            socks5NetWork: runtime.socks5NetWork || this._socks5NetWork,
            maxIdleConns: runtime.maxIdleConns || this._maxIdleConns,
            retryOptions: this._retryOptions,
            ignoreSSL: runtime.ignoreSSL,
            tlsMinVersion: this._tlsMinVersion,
            disableHttp2: this._disableHttp2 || false,
        };
        let _retriesAttempted = 0;
        let _lastRequest = null, _lastResponse = null;
        let _context = new $dara.RetryPolicyContext({
            retriesAttempted: _retriesAttempted,
        });
        while ($dara.shouldRetry(_runtime['retryOptions'], _context)) {
            if (_retriesAttempted > 0) {
                let _backoffTime = $dara.getBackoffDelay(_runtime['retryOptions'], _context);
                if (_backoffTime > 0) {
                    await $dara.sleep(_backoffTime);
                }
            }
            _retriesAttempted = _retriesAttempted + 1;
            try {
                let request_ = new $dara.Request();
                // spi = new Gateway();//Gateway implements SPI，这一步在产品 SDK 中实例化
                let headers = this.getRpcHeaders();
                let globalQueries = {};
                let globalHeaders = {};
                if (!$dara.isNull(this._globalParameters)) {
                    let globalParams = this._globalParameters;
                    if (!$dara.isNull(globalParams.queries)) {
                        globalQueries = globalParams.queries;
                    }
                    if (!$dara.isNull(globalParams.headers)) {
                        globalHeaders = globalParams.headers;
                    }
                }
                let extendsHeaders = {};
                let extendsQueries = {};
                if (!$dara.isNull(runtime.extendsParameters)) {
                    let extendsParameters = runtime.extendsParameters;
                    if (!$dara.isNull(extendsParameters.headers)) {
                        extendsHeaders = extendsParameters.headers;
                    }
                    if (!$dara.isNull(extendsParameters.queries)) {
                        extendsQueries = extendsParameters.queries;
                    }
                }
                let requestContext = new $SPI.InterceptorContextRequest({
                    headers: Object.assign(Object.assign(Object.assign(Object.assign({}, globalHeaders), extendsHeaders), request.headers), headers),
                    query: Object.assign(Object.assign(Object.assign({}, globalQueries), extendsQueries), request.query),
                    body: request.body,
                    stream: request.stream,
                    hostMap: request.hostMap,
                    pathname: params.pathname,
                    productId: this._productId,
                    action: params.action,
                    version: params.version,
                    protocol: this._protocol || params.protocol,
                    method: this._method || params.method,
                    authType: params.authType,
                    bodyType: params.bodyType,
                    reqBodyType: params.reqBodyType,
                    style: params.style,
                    credential: this._credential,
                    signatureVersion: this._signatureVersion,
                    signatureAlgorithm: this._signatureAlgorithm,
                    userAgent: utils_1.default.getUserAgent(this._userAgent),
                });
                let configurationContext = new $SPI.InterceptorContextConfiguration({
                    regionId: this._regionId,
                    endpoint: request.endpointOverride || this._endpoint,
                    endpointRule: this._endpointRule,
                    endpointMap: this._endpointMap,
                    endpointType: this._endpointType,
                    network: this._network,
                    suffix: this._suffix,
                });
                let interceptorContext = new $SPI.InterceptorContext({
                    request: requestContext,
                    configuration: configurationContext,
                });
                let attributeMap = new $SPI.AttributeMap({});
                if (!$dara.isNull(this._attributeMap)) {
                    attributeMap = this._attributeMap;
                }
                // 1. spi.modifyConfiguration(context: SPI.InterceptorContext, attributeMap: SPI.AttributeMap);
                await this._spi.modifyConfiguration(interceptorContext, attributeMap);
                // 2. spi.modifyRequest(context: SPI.InterceptorContext, attributeMap: SPI.AttributeMap);
                await this._spi.modifyRequest(interceptorContext, attributeMap);
                request_.protocol = interceptorContext.request.protocol;
                request_.method = interceptorContext.request.method;
                request_.pathname = interceptorContext.request.pathname;
                request_.query = interceptorContext.request.query;
                request_.body = interceptorContext.request.stream;
                request_.headers = interceptorContext.request.headers;
                _lastRequest = request_;
                let response_ = await $dara.doAction(request_, _runtime);
                _lastResponse = response_;
                let responseContext = new $SPI.InterceptorContextResponse({
                    statusCode: response_.statusCode,
                    headers: response_.headers,
                    body: response_.body,
                });
                interceptorContext.response = responseContext;
                // 3. spi.modifyResponse(context: SPI.InterceptorContext, attributeMap: SPI.AttributeMap);
                await this._spi.modifyResponse(interceptorContext, attributeMap);
                return {
                    headers: interceptorContext.response.headers,
                    statusCode: interceptorContext.response.statusCode,
                    body: interceptorContext.response.deserializedBody,
                };
            }
            catch (ex) {
                _context = new $dara.RetryPolicyContext({
                    retriesAttempted: _retriesAttempted,
                    httpRequest: _lastRequest,
                    httpResponse: _lastResponse,
                    exception: ex,
                });
                continue;
            }
        }
        throw $dara.newUnretryableError(_context);
    }
    callSSEApi(params, request, runtime) {
        return __asyncGenerator(this, arguments, function* callSSEApi_1() {
            var e_1, _a;
            let _runtime = {
                key: runtime.key || this._key,
                cert: runtime.cert || this._cert,
                ca: runtime.ca || this._ca,
                readTimeout: runtime.readTimeout || this._readTimeout,
                connectTimeout: runtime.connectTimeout || this._connectTimeout,
                httpProxy: runtime.httpProxy || this._httpProxy,
                httpsProxy: runtime.httpsProxy || this._httpsProxy,
                noProxy: runtime.noProxy || this._noProxy,
                socks5Proxy: runtime.socks5Proxy || this._socks5Proxy,
                socks5NetWork: runtime.socks5NetWork || this._socks5NetWork,
                maxIdleConns: runtime.maxIdleConns || this._maxIdleConns,
                retryOptions: this._retryOptions,
                ignoreSSL: runtime.ignoreSSL,
                tlsMinVersion: this._tlsMinVersion,
            };
            let _retriesAttempted = 0;
            let _lastRequest = null, _lastResponse = null;
            let _context = new $dara.RetryPolicyContext({
                retriesAttempted: _retriesAttempted,
            });
            while ($dara.shouldRetry(_runtime['retryOptions'], _context)) {
                if (_retriesAttempted > 0) {
                    let _backoffTime = $dara.getBackoffDelay(_runtime['retryOptions'], _context);
                    if (_backoffTime > 0) {
                        yield __await($dara.sleep(_backoffTime));
                    }
                }
                _retriesAttempted = _retriesAttempted + 1;
                try {
                    let request_ = new $dara.Request();
                    request_.protocol = this._protocol || params.protocol;
                    request_.method = params.method;
                    request_.pathname = params.pathname;
                    let globalQueries = {};
                    let globalHeaders = {};
                    if (!$dara.isNull(this._globalParameters)) {
                        let globalParams = this._globalParameters;
                        if (!$dara.isNull(globalParams.queries)) {
                            globalQueries = globalParams.queries;
                        }
                        if (!$dara.isNull(globalParams.headers)) {
                            globalHeaders = globalParams.headers;
                        }
                    }
                    let extendsHeaders = {};
                    let extendsQueries = {};
                    if (!$dara.isNull(runtime.extendsParameters)) {
                        let extendsParameters = runtime.extendsParameters;
                        if (!$dara.isNull(extendsParameters.headers)) {
                            extendsHeaders = extendsParameters.headers;
                        }
                        if (!$dara.isNull(extendsParameters.queries)) {
                            extendsQueries = extendsParameters.queries;
                        }
                    }
                    request_.query = Object.assign(Object.assign(Object.assign({}, globalQueries), extendsQueries), request.query);
                    // endpoint is setted in product client
                    request_.headers = Object.assign(Object.assign(Object.assign({ host: this._endpoint, 'x-acs-version': params.version, 'x-acs-action': params.action, 'user-agent': utils_1.default.getUserAgent(this._userAgent), 'x-acs-date': utils_1.default.getTimestamp(), 'x-acs-signature-nonce': utils_1.default.getNonce(), accept: "application/json" }, extendsHeaders), globalHeaders), request.headers);
                    if (params.style == "RPC") {
                        let headers = this.getRpcHeaders();
                        if (!$dara.isNull(headers)) {
                            request_.headers = Object.assign(Object.assign({}, request_.headers), headers);
                        }
                    }
                    let signatureAlgorithm = this._signatureAlgorithm || "ACS3-HMAC-SHA256";
                    let hashedRequestPayload = utils_1.default.hash(Buffer.from("", "utf-8"), signatureAlgorithm);
                    if (!$dara.isNull(request.stream)) {
                        let tmp = yield __await($dara.Stream.readAsBytes(request.stream));
                        hashedRequestPayload = utils_1.default.hash(tmp, signatureAlgorithm);
                        request_.body = new $dara.BytesReadable(tmp);
                        request_.headers["content-type"] = "application/octet-stream";
                    }
                    else {
                        if (!$dara.isNull(request.body)) {
                            if (params.reqBodyType == "byte") {
                                let byteObj = Buffer.from(request.body);
                                hashedRequestPayload = utils_1.default.hash(byteObj, signatureAlgorithm);
                                request_.body = new $dara.BytesReadable(byteObj);
                            }
                            else if (params.reqBodyType == "json") {
                                let jsonObj = typeof request.body === "string" ? request.body : JSON.stringify(request.body);
                                hashedRequestPayload = utils_1.default.hash(Buffer.from(jsonObj, "utf8"), signatureAlgorithm);
                                request_.body = new $dara.BytesReadable(jsonObj);
                                request_.headers["content-type"] = "application/json; charset=utf-8";
                            }
                            else {
                                let m = request.body;
                                let formObj = utils_1.default.toForm(m);
                                hashedRequestPayload = utils_1.default.hash(Buffer.from(formObj, "utf8"), signatureAlgorithm);
                                request_.body = new $dara.BytesReadable(formObj);
                                request_.headers["content-type"] = "application/x-www-form-urlencoded";
                            }
                        }
                    }
                    request_.headers["x-acs-content-sha256"] = hashedRequestPayload.toString("hex");
                    if (params.authType != "Anonymous") {
                        let credentialModel = yield __await(this._credential.getCredential());
                        if (!$dara.isNull(credentialModel.providerName)) {
                            request_.headers["x-acs-credentials-provider"] = credentialModel.providerName;
                        }
                        let authType = credentialModel.type;
                        if (authType == "bearer") {
                            let bearerToken = credentialModel.bearerToken;
                            request_.headers["x-acs-bearer-token"] = bearerToken;
                        }
                        else if (authType == "id_token") {
                            let idToken = credentialModel.securityToken;
                            request_.headers["x-acs-zero-trust-idtoken"] = idToken;
                        }
                        else {
                            let accessKeyId = credentialModel.accessKeyId;
                            let accessKeySecret = credentialModel.accessKeySecret;
                            let securityToken = credentialModel.securityToken;
                            if (!$dara.isNull(securityToken) && securityToken != "") {
                                request_.headers["x-acs-accesskey-id"] = accessKeyId;
                                request_.headers["x-acs-security-token"] = securityToken;
                            }
                            request_.headers["Authorization"] = utils_1.default.getAuthorization(request_, signatureAlgorithm, hashedRequestPayload.toString("hex"), accessKeyId, accessKeySecret);
                        }
                    }
                    _lastRequest = request_;
                    let response_ = yield __await($dara.doAction(request_, _runtime));
                    _lastResponse = response_;
                    if ((response_.statusCode >= 400) && (response_.statusCode < 600)) {
                        let err = {};
                        if (!$dara.isNull(response_.headers["content-type"]) && response_.headers["content-type"] == "text/xml;charset=utf-8") {
                            let _str = yield __await($dara.Stream.readAsString(response_.body));
                            let respMap = $dara.XML.parseXml(_str, null);
                            err = respMap["Error"];
                        }
                        else {
                            let _res = yield __await($dara.Stream.readAsJSON(response_.body));
                            err = _res;
                        }
                        err["statusCode"] = response_.statusCode;
                        throw $dara.newError({
                            code: `${err["Code"] || err["code"]}`,
                            message: `code: ${response_.statusCode}, ${err["Message"] || err["message"]} request id: ${err["RequestId"] || err["requestId"]}`,
                            data: err,
                            description: `${err["Description"] || err["description"]}`,
                            accessDeniedDetail: err["AccessDeniedDetail"] || err["accessDeniedDetail"],
                        });
                    }
                    let events = yield __await($dara.Stream.readAsSSE(response_.body));
                    try {
                        for (var events_1 = (e_1 = void 0, __asyncValues(events)), events_1_1; events_1_1 = yield __await(events_1.next()), !events_1_1.done;) {
                            let event = events_1_1.value;
                            yield yield __await(new $_model.SSEResponse({
                                statusCode: response_.statusCode,
                                headers: response_.headers,
                                event: event,
                            }));
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (events_1_1 && !events_1_1.done && (_a = events_1.return)) yield __await(_a.call(events_1));
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return yield __await(null);
                }
                catch (ex) {
                    _context = new $dara.RetryPolicyContext({
                        retriesAttempted: _retriesAttempted,
                        httpRequest: _lastRequest,
                        httpResponse: _lastResponse,
                        exception: ex,
                    });
                    continue;
                }
            }
            throw $dara.newUnretryableError(_context);
        });
    }
    async callApi(params, request, runtime) {
        if ($dara.isNull(params)) {
            throw new $_error.ClientError({
                code: "ParameterMissing",
                message: "'params' can not be unset",
            });
        }
        if ($dara.isNull(this._signatureVersion) || this._signatureVersion != "v4") {
            if ($dara.isNull(this._signatureAlgorithm) || this._signatureAlgorithm != "v2") {
                return await this.doRequest(params, request, runtime);
            }
            else if ((params.style == "ROA") && (params.reqBodyType == "json")) {
                return await this.doROARequest(params.action, params.version, params.protocol, params.method, params.authType, params.pathname, params.bodyType, request, runtime);
            }
            else if (params.style == "ROA") {
                return await this.doROARequestWithForm(params.action, params.version, params.protocol, params.method, params.authType, params.pathname, params.bodyType, request, runtime);
            }
            else {
                return await this.doRPCRequest(params.action, params.version, params.protocol, params.method, params.authType, params.bodyType, request, runtime);
            }
        }
        else {
            return await this.execute(params, request, runtime);
        }
    }
    /**
     * @remarks
     * Get accesskey id by using credential
     * @returns accesskey id
     */
    async getAccessKeyId() {
        if ($dara.isNull(this._credential)) {
            return "";
        }
        let accessKeyId = await this._credential.getAccessKeyId();
        return accessKeyId;
    }
    /**
     * @remarks
     * Get accesskey secret by using credential
     * @returns accesskey secret
     */
    async getAccessKeySecret() {
        if ($dara.isNull(this._credential)) {
            return "";
        }
        let secret = await this._credential.getAccessKeySecret();
        return secret;
    }
    /**
     * @remarks
     * Get security token by using credential
     * @returns security token
     */
    async getSecurityToken() {
        if ($dara.isNull(this._credential)) {
            return "";
        }
        let token = await this._credential.getSecurityToken();
        return token;
    }
    /**
     * @remarks
     * Get bearer token by credential
     * @returns bearer token
     */
    async getBearerToken() {
        if ($dara.isNull(this._credential)) {
            return "";
        }
        let token = this._credential.getBearerToken();
        return token;
    }
    /**
     * @remarks
     * Get credential type by credential
     * @returns credential type e.g. access_key
     */
    async getType() {
        if ($dara.isNull(this._credential)) {
            return "";
        }
        let authType = this._credential.getType();
        return authType;
    }
    /**
     * @remarks
     * If the endpointRule and config.endpoint are empty, throw error
     *
     * @param config - config contains the necessary information to create a client
     */
    checkConfig(config) {
        if ($dara.isNull(this._endpointRule) && $dara.isNull(config.endpoint)) {
            throw new $_error.ClientError({
                code: "ParameterMissing",
                message: "'config.endpoint' can not be empty",
            });
        }
    }
    /**
     * @remarks
     * set gateway client
     *
     * @param spi - .
     */
    setGatewayClient(spi) {
        this._spi = spi;
    }
    /**
     * @remarks
     * set RPC header for debug
     *
     * @param headers - headers for debug, this header can be used only once.
     */
    setRpcHeaders(headers) {
        this._headers = headers;
    }
    /**
     * @remarks
     * get RPC header for debug
     */
    getRpcHeaders() {
        let headers = this._headers;
        this._headers = null;
        return headers;
    }
    getAccessDeniedDetail(err) {
        let accessDeniedDetail = null;
        if (!$dara.isNull(err["AccessDeniedDetail"])) {
            let detail1 = err["AccessDeniedDetail"];
            accessDeniedDetail = detail1;
        }
        else if (!$dara.isNull(err["accessDeniedDetail"])) {
            let detail2 = err["accessDeniedDetail"];
            accessDeniedDetail = detail2;
        }
        return accessDeniedDetail;
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map