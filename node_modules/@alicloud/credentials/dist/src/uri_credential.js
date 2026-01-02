"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpx_1 = __importDefault(require("httpx"));
const config_1 = __importDefault(require("./config"));
const session_credential_1 = __importDefault(require("./session_credential"));
class URICredential extends session_credential_1.default {
    constructor(uri) {
        const conf = new config_1.default({
            type: 'credentials_uri',
            credentialsURI: uri
        });
        super(conf);
        if (!uri) {
            this.credentialsURI = process.env['ALIBABA_CLOUD_CREDENTIALS_URI'];
        }
        else {
            this.credentialsURI = uri;
        }
        if (!this.credentialsURI) {
            throw new Error('Missing required credentialsURI option in config or environment variable for credentials_uri');
        }
    }
    async updateCredential() {
        const url = this.credentialsURI;
        const response = await httpx_1.default.request(url, { readTimeout: this.readTimeout, connectTimeout: this.connectTimeout });
        if (response.statusCode !== 200) {
            throw new Error(`Get credentials from ${url} failed, status code is ${response.statusCode}`);
        }
        const body = (await httpx_1.default.read(response, 'utf8'));
        let json;
        try {
            json = JSON.parse(body);
        }
        catch (ex) {
            throw new Error(`Get credentials from ${url} failed, unmarshal response failed, JSON is: ${body}`);
        }
        if (json.Code !== 'Success') {
            throw new Error(`Get credentials from ${url} failed, Code is ${json.Code}`);
        }
        this.sessionCredential = {
            AccessKeyId: json.AccessKeyId,
            AccessKeySecret: json.AccessKeySecret,
            Expiration: json.Expiration,
            SecurityToken: json.SecurityToken,
        };
    }
}
exports.default = URICredential;
//# sourceMappingURL=uri_credential.js.map