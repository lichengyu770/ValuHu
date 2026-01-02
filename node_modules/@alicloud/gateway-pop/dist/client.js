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
// This file is auto-generated, don't edit it
const gateway_spi_1 = __importDefault(require("@alicloud/gateway-spi"));
const tea_util_1 = __importDefault(require("@alicloud/tea-util"));
const openapi_util_1 = __importDefault(require("@alicloud/openapi-util"));
const endpoint_util_1 = __importDefault(require("@alicloud/endpoint-util"));
const darabonba_encode_util_1 = __importDefault(require("@alicloud/darabonba-encode-util"));
const darabonba_signature_util_1 = __importDefault(require("@alicloud/darabonba-signature-util"));
const darabonba_string_1 = __importDefault(require("@alicloud/darabonba-string"));
const darabonba_map_1 = __importDefault(require("@alicloud/darabonba-map"));
const darabonba_array_1 = __importDefault(require("@alicloud/darabonba-array"));
const $tea = __importStar(require("@alicloud/tea-typescript"));
class Client extends gateway_spi_1.default {
    constructor() {
        super();
        this._sha256 = "ACS4-HMAC-SHA256";
        this._sm3 = "ACS4-HMAC-SM3";
    }
    async modifyConfiguration(context, attributeMap) {
        let request = context.request;
        let config = context.configuration;
        config.endpoint = this.getEndpoint(request.productId, config.regionId, config.endpointRule, config.network, config.suffix, config.endpointMap, config.endpoint);
    }
    async modifyRequest(context, attributeMap) {
        let request = context.request;
        let config = context.configuration;
        let date = openapi_util_1.default.getTimestamp();
        request.headers = Object.assign({ host: config.endpoint, 'x-acs-version': request.version, 'x-acs-action': request.action, 'user-agent': request.userAgent, 'x-acs-date': date, 'x-acs-signature-nonce': tea_util_1.default.getNonce(), accept: "application/json" }, request.headers);
        let signatureAlgorithm = tea_util_1.default.defaultString(request.signatureAlgorithm, this._sha256);
        let hashedRequestPayload = darabonba_encode_util_1.default.hexEncode(darabonba_encode_util_1.default.hash(tea_util_1.default.toBytes(""), signatureAlgorithm));
        if (!tea_util_1.default.isUnset(request.stream)) {
            let tmp = await tea_util_1.default.readAsBytes(request.stream);
            hashedRequestPayload = darabonba_encode_util_1.default.hexEncode(darabonba_encode_util_1.default.hash(tmp, signatureAlgorithm));
            request.stream = new $tea.BytesReadable(tmp);
            request.headers["content-type"] = "application/octet-stream";
        }
        else {
            if (!tea_util_1.default.isUnset(request.body)) {
                if (tea_util_1.default.equalString(request.reqBodyType, "json")) {
                    let jsonObj = tea_util_1.default.toJSONString(request.body);
                    hashedRequestPayload = darabonba_encode_util_1.default.hexEncode(darabonba_encode_util_1.default.hash(tea_util_1.default.toBytes(jsonObj), signatureAlgorithm));
                    request.stream = new $tea.BytesReadable(jsonObj);
                    request.headers["content-type"] = "application/json; charset=utf-8";
                }
                else {
                    let m = tea_util_1.default.assertAsMap(request.body);
                    let formObj = openapi_util_1.default.toForm(m);
                    hashedRequestPayload = darabonba_encode_util_1.default.hexEncode(darabonba_encode_util_1.default.hash(tea_util_1.default.toBytes(formObj), signatureAlgorithm));
                    request.stream = new $tea.BytesReadable(formObj);
                    request.headers["content-type"] = "application/x-www-form-urlencoded";
                }
            }
        }
        if (tea_util_1.default.equalString(signatureAlgorithm, this._sm3)) {
            request.headers["x-acs-content-sm3"] = hashedRequestPayload;
        }
        else {
            request.headers["x-acs-content-sha256"] = hashedRequestPayload;
        }
        if (!tea_util_1.default.equalString(request.authType, "Anonymous")) {
            let credential = request.credential;
            if (tea_util_1.default.isUnset(credential)) {
                throw $tea.newError({
                    code: "ParameterMissing",
                    message: "'config.credential' can not be unset",
                });
            }
            let authType = credential.getType();
            if (tea_util_1.default.equalString(authType, "bearer")) {
                let bearerToken = credential.getBearerToken();
                request.headers["x-acs-bearer-token"] = bearerToken;
                request.headers["Authorization"] = `Bearer ${bearerToken}`;
            }
            else {
                let accessKeyId = await credential.getAccessKeyId();
                let accessKeySecret = await credential.getAccessKeySecret();
                let securityToken = await credential.getSecurityToken();
                if (!tea_util_1.default.empty(securityToken)) {
                    request.headers["x-acs-accesskey-id"] = accessKeyId;
                    request.headers["x-acs-security-token"] = securityToken;
                }
                let dateNew = darabonba_string_1.default.subString(date, 0, 10);
                dateNew = darabonba_string_1.default.replace(dateNew, "-", "", null);
                let region = this.getRegion(request.productId, config.endpoint);
                let signingkey = await this.getSigningkey(signatureAlgorithm, accessKeySecret, request.productId, region, dateNew);
                request.headers["Authorization"] = await this.getAuthorization(request.pathname, request.method, request.query, request.headers, signatureAlgorithm, hashedRequestPayload, accessKeyId, signingkey, request.productId, region, dateNew);
            }
        }
    }
    async modifyResponse(context, attributeMap) {
        let request = context.request;
        let response = context.response;
        if (tea_util_1.default.is4xx(response.statusCode) || tea_util_1.default.is5xx(response.statusCode)) {
            let _res = await tea_util_1.default.readAsJSON(response.body);
            let err = tea_util_1.default.assertAsMap(_res);
            let requestId = this.defaultAny(err["RequestId"], err["requestId"]);
            if (!tea_util_1.default.isUnset(response.headers["x-acs-request-id"])) {
                requestId = response.headers["x-acs-request-id"];
            }
            err["statusCode"] = response.statusCode;
            throw $tea.newError({
                code: `${this.defaultAny(err["Code"], err["code"])}`,
                message: `code: ${response.statusCode}, ${this.defaultAny(err["Message"], err["message"])} request id: ${requestId}`,
                data: err,
                description: `${this.defaultAny(err["Description"], err["description"])}`,
                accessDeniedDetail: this.defaultAny(err["AccessDeniedDetail"], err["accessDeniedDetail"]),
            });
        }
        if (tea_util_1.default.equalNumber(response.statusCode, 204)) {
            await tea_util_1.default.readAsString(response.body);
        }
        else if (tea_util_1.default.equalString(request.bodyType, "binary")) {
            response.deserializedBody = response.body;
        }
        else if (tea_util_1.default.equalString(request.bodyType, "byte")) {
            let byt = await tea_util_1.default.readAsBytes(response.body);
            response.deserializedBody = byt;
        }
        else if (tea_util_1.default.equalString(request.bodyType, "string")) {
            let str = await tea_util_1.default.readAsString(response.body);
            response.deserializedBody = str;
        }
        else if (tea_util_1.default.equalString(request.bodyType, "json")) {
            let obj = await tea_util_1.default.readAsJSON(response.body);
            let res = tea_util_1.default.assertAsMap(obj);
            response.deserializedBody = res;
        }
        else if (tea_util_1.default.equalString(request.bodyType, "array")) {
            let arr = await tea_util_1.default.readAsJSON(response.body);
            response.deserializedBody = arr;
        }
        else {
            response.deserializedBody = await tea_util_1.default.readAsString(response.body);
        }
    }
    getEndpoint(productId, regionId, endpointRule, network, suffix, endpointMap, endpoint) {
        if (!tea_util_1.default.empty(endpoint)) {
            return endpoint;
        }
        if (!tea_util_1.default.isUnset(endpointMap) && !tea_util_1.default.empty(endpointMap[regionId])) {
            return endpointMap[regionId];
        }
        return endpoint_util_1.default.getEndpointRules(productId, regionId, endpointRule, network, suffix);
    }
    defaultAny(inputValue, defaultValue) {
        if (tea_util_1.default.isUnset(inputValue)) {
            return defaultValue;
        }
        return inputValue;
    }
    async getAuthorization(pathname, method, query, headers, signatureAlgorithm, payload, ak, signingkey, product, region, date) {
        let signature = await this.getSignature(pathname, method, query, headers, signatureAlgorithm, payload, signingkey);
        let signedHeaders = await this.getSignedHeaders(headers);
        let signedHeadersStr = darabonba_array_1.default.join(signedHeaders, ";");
        return `${signatureAlgorithm} Credential=${ak}/${date}/${region}/${product}/aliyun_v4_request,SignedHeaders=${signedHeadersStr},Signature=${signature}`;
    }
    async getSignature(pathname, method, query, headers, signatureAlgorithm, payload, signingkey) {
        let canonicalURI = "/";
        if (!tea_util_1.default.empty(pathname)) {
            canonicalURI = pathname;
        }
        let stringToSign = "";
        let canonicalizedResource = await this.buildCanonicalizedResource(query);
        let canonicalizedHeaders = await this.buildCanonicalizedHeaders(headers);
        let signedHeaders = await this.getSignedHeaders(headers);
        let signedHeadersStr = darabonba_array_1.default.join(signedHeaders, ";");
        stringToSign = `${method}\n${canonicalURI}\n${canonicalizedResource}\n${canonicalizedHeaders}\n${signedHeadersStr}\n${payload}`;
        let hex = darabonba_encode_util_1.default.hexEncode(darabonba_encode_util_1.default.hash(tea_util_1.default.toBytes(stringToSign), signatureAlgorithm));
        stringToSign = `${signatureAlgorithm}\n${hex}`;
        let signature = tea_util_1.default.toBytes("");
        if (tea_util_1.default.equalString(signatureAlgorithm, this._sha256)) {
            signature = darabonba_signature_util_1.default.HmacSHA256SignByBytes(stringToSign, signingkey);
        }
        else if (tea_util_1.default.equalString(signatureAlgorithm, this._sm3)) {
            signature = darabonba_signature_util_1.default.HmacSM3SignByBytes(stringToSign, signingkey);
        }
        return darabonba_encode_util_1.default.hexEncode(signature);
    }
    async getSigningkey(signatureAlgorithm, secret, product, region, date) {
        let sc1 = `aliyun_v4${secret}`;
        let sc2 = tea_util_1.default.toBytes("");
        if (tea_util_1.default.equalString(signatureAlgorithm, this._sha256)) {
            sc2 = darabonba_signature_util_1.default.HmacSHA256Sign(date, sc1);
        }
        else if (tea_util_1.default.equalString(signatureAlgorithm, this._sm3)) {
            sc2 = darabonba_signature_util_1.default.HmacSM3Sign(date, sc1);
        }
        let sc3 = tea_util_1.default.toBytes("");
        if (tea_util_1.default.equalString(signatureAlgorithm, this._sha256)) {
            sc3 = darabonba_signature_util_1.default.HmacSHA256SignByBytes(region, sc2);
        }
        else if (tea_util_1.default.equalString(signatureAlgorithm, this._sm3)) {
            sc3 = darabonba_signature_util_1.default.HmacSM3SignByBytes(region, sc2);
        }
        let sc4 = tea_util_1.default.toBytes("");
        if (tea_util_1.default.equalString(signatureAlgorithm, this._sha256)) {
            sc4 = darabonba_signature_util_1.default.HmacSHA256SignByBytes(product, sc3);
        }
        else if (tea_util_1.default.equalString(signatureAlgorithm, this._sm3)) {
            sc4 = darabonba_signature_util_1.default.HmacSM3SignByBytes(product, sc3);
        }
        let hmac = tea_util_1.default.toBytes("");
        if (tea_util_1.default.equalString(signatureAlgorithm, this._sha256)) {
            hmac = darabonba_signature_util_1.default.HmacSHA256SignByBytes("aliyun_v4_request", sc4);
        }
        else if (tea_util_1.default.equalString(signatureAlgorithm, this._sm3)) {
            hmac = darabonba_signature_util_1.default.HmacSM3SignByBytes("aliyun_v4_request", sc4);
        }
        return hmac;
    }
    getRegion(product, endpoint) {
        let region = "center";
        if (tea_util_1.default.empty(product) || tea_util_1.default.empty(endpoint)) {
            return region;
        }
        let preRegion = darabonba_string_1.default.replace(endpoint, ".aliyuncs.com", "", null);
        let nodes = darabonba_string_1.default.split(preRegion, ".", null);
        if (tea_util_1.default.equalNumber(darabonba_array_1.default.size(nodes), 2)) {
            region = nodes[1];
        }
        return region;
    }
    async buildCanonicalizedResource(query) {
        let canonicalizedResource = "";
        if (!tea_util_1.default.isUnset(query)) {
            let queryArray = darabonba_map_1.default.keySet(query);
            let sortedQueryArray = darabonba_array_1.default.ascSort(queryArray);
            let separator = "";
            for (let key of sortedQueryArray) {
                canonicalizedResource = `${canonicalizedResource}${separator}${darabonba_encode_util_1.default.percentEncode(key)}`;
                if (!tea_util_1.default.empty(query[key])) {
                    canonicalizedResource = `${canonicalizedResource}=${darabonba_encode_util_1.default.percentEncode(query[key])}`;
                }
                separator = "&";
            }
        }
        return canonicalizedResource;
    }
    async buildCanonicalizedHeaders(headers) {
        let canonicalizedHeaders = "";
        let sortedHeaders = await this.getSignedHeaders(headers);
        for (let header of sortedHeaders) {
            canonicalizedHeaders = `${canonicalizedHeaders}${header}:${darabonba_string_1.default.trim(headers[header])}\n`;
        }
        return canonicalizedHeaders;
    }
    async getSignedHeaders(headers) {
        let headersArray = darabonba_map_1.default.keySet(headers);
        let sortedHeadersArray = darabonba_array_1.default.ascSort(headersArray);
        let tmp = "";
        let separator = "";
        for (let key of sortedHeadersArray) {
            let lowerKey = darabonba_string_1.default.toLower(key);
            if (darabonba_string_1.default.hasPrefix(lowerKey, "x-acs-") || darabonba_string_1.default.equals(lowerKey, "host") || darabonba_string_1.default.equals(lowerKey, "content-type")) {
                if (!darabonba_string_1.default.contains(tmp, lowerKey)) {
                    tmp = `${tmp}${separator}${lowerKey}`;
                    separator = ";";
                }
            }
        }
        return darabonba_string_1.default.split(tmp, ";", null);
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map