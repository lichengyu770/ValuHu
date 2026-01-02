"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doRequest = exports.Response = exports.RequestBuilder = exports.Request = void 0;
const httpx_1 = __importDefault(require("httpx"));
class Request {
    static builder() {
        return new RequestBuilder();
    }
    constructor(builder) {
        this.method = builder.method;
        this.protocol = builder.protocol;
        this.host = builder.host;
        this.path = builder.path;
        this.queries = builder.queries;
        this.headers = builder.headers;
        this.bodyForm = builder.bodyForm;
        this.bodyBytes = builder.bodyBytes;
        this.url = builder.url;
        this.readTimeout = builder.readTimeout;
        this.connectTimeout = builder.connectTimeout;
    }
    toRequestURL() {
        if (this.url) {
            return this.url;
        }
        let url = `${this.protocol}://${this.host}${this.path}`;
        if (this.queries && Object.keys(this.queries).length > 0) {
            url += `?` + querystringify(this.queries);
        }
        return url;
    }
}
exports.Request = Request;
class RequestBuilder {
    build() {
        // set default values
        if (!this.protocol) {
            this.protocol = 'https';
        }
        if (!this.path) {
            this.path = '/';
        }
        if (!this.headers) {
            this.headers = {};
        }
        if (!this.queries) {
            this.queries = {};
        }
        return new Request(this);
    }
    withMethod(method) {
        this.method = method;
        return this;
    }
    withProtocol(protocol) {
        this.protocol = protocol;
        return this;
    }
    withHost(host) {
        this.host = host;
        return this;
    }
    withPath(path) {
        this.path = path;
        return this;
    }
    withQueries(queries) {
        this.queries = queries;
        return this;
    }
    withHeaders(headers) {
        this.headers = headers;
        return this;
    }
    withBodyForm(bodyForm) {
        this.bodyForm = bodyForm;
        return this;
    }
    withURL(url) {
        this.url = url;
        return this;
    }
    withReadTimeout(readTimeout) {
        this.readTimeout = readTimeout;
        return this;
    }
    withConnectTimeout(connectTimeout) {
        this.connectTimeout = connectTimeout;
        return this;
    }
}
exports.RequestBuilder = RequestBuilder;
class Response {
    static builder() {
        return new ResponseBuilder();
    }
    constructor(builder) {
        this.statusCode = builder.statusCode;
        this.headers = builder.headers;
        this.body = builder.body;
    }
}
exports.Response = Response;
class ResponseBuilder {
    withStatusCode(statusCode) {
        this.statusCode = statusCode;
        return this;
    }
    withHeaders(headers) {
        this.headers = headers;
        return this;
    }
    withBody(body) {
        this.body = body;
        return this;
    }
    constructor() {
        this.headers = {};
    }
    build() {
        return new Response(this);
    }
}
function querystringify(queries) {
    const fields = [];
    for (const [key, value] of Object.entries(queries)) {
        fields.push(key + '=' + encodeURIComponent(value));
    }
    return fields.join('&');
}
async function doRequest(req) {
    const url = req.toRequestURL();
    let body;
    if (req.bodyForm && Object.keys(req.bodyForm).length > 0) {
        body = querystringify(req.bodyForm);
        if (!req.headers['Content-Type']) {
            req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
    }
    const response = await httpx_1.default.request(url, {
        method: req.method,
        data: body,
        headers: req.headers,
        readTimeout: req.readTimeout,
        connectTimeout: req.connectTimeout
    });
    const responseBody = await httpx_1.default.read(response, '');
    return Response.builder()
        .withStatusCode(response.statusCode)
        .withHeaders(response.headers)
        .withBody(responseBody)
        .build();
}
exports.doRequest = doRequest;
//# sourceMappingURL=http.js.map