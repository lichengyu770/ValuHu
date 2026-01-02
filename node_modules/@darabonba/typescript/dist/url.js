"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var url = __importStar(require("url"));
var portMap = {
    ftp: '21',
    gopher: '70',
    http: '80',
    https: '443',
    ws: '80',
    wss: '443',
};
var TeaURL = /** @class */ (function () {
    function TeaURL(str) {
        this._url = new url.URL(str);
    }
    TeaURL.prototype.path = function () {
        return this._url.pathname + this._url.search;
    };
    TeaURL.prototype.pathname = function () {
        return this._url.pathname;
    };
    TeaURL.prototype.protocol = function () {
        return this._url.protocol ? this._url.protocol.replace(':', '') : '';
    };
    TeaURL.prototype.hostname = function () {
        return this._url.hostname;
    };
    TeaURL.prototype.host = function () {
        return this._url.host;
    };
    TeaURL.prototype.port = function () {
        return this._url.port || portMap[this.protocol()];
    };
    TeaURL.prototype.hash = function () {
        return this._url.hash ? this._url.hash.replace('#', '') : '';
    };
    TeaURL.prototype.search = function () {
        return this._url.search ? this._url.search.replace('?', '') : '';
    };
    TeaURL.prototype.href = function () {
        return this._url.href;
    };
    TeaURL.prototype.auth = function () {
        return "".concat(this._url.username, ":").concat(this._url.password);
    };
    TeaURL.parse = function (url) {
        return new TeaURL(url);
    };
    TeaURL.urlEncode = function (url) {
        return url != null ? encodeURIComponent(url) : '';
    };
    TeaURL.percentEncode = function (raw) {
        return raw != null ? encodeURIComponent(raw).replace('+', '%20')
            .replace('*', '%2A').replace('%7E', '~') : null;
    };
    TeaURL.pathEncode = function (path) {
        if (!path || path === '/') {
            return path;
        }
        var paths = path.split('/');
        var sb = [];
        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            var s = paths_1[_i];
            sb.push(TeaURL.percentEncode(s));
        }
        return sb.join('/');
    };
    return TeaURL;
}());
exports.default = TeaURL;
//# sourceMappingURL=url.js.map