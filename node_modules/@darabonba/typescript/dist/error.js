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
Object.defineProperty(exports, "__esModule", { value: true });
exports.newUnretryableError = exports.newError = exports.retryError = exports.ResponseError = exports.BaseError = void 0;
var retry_1 = require("./retry");
var BaseError = /** @class */ (function (_super) {
    __extends(BaseError, _super);
    function BaseError(map) {
        var _this = _super.call(this, "".concat(map.code, ": ").concat(map.message)) || this;
        _this.name = 'BaseError';
        _this.code = map.code;
        return _this;
    }
    return BaseError;
}(Error));
exports.BaseError = BaseError;
var ResponseError = /** @class */ (function (_super) {
    __extends(ResponseError, _super);
    function ResponseError(map) {
        var _this = _super.call(this, map) || this;
        _this.name = 'ResponseError';
        _this.data = map.data;
        _this.description = map.description;
        _this.retryAfter = map.retryAfter;
        _this.accessDeniedDetail = map.accessDeniedDetail;
        if (_this.data && _this.data.statusCode) {
            _this.statusCode = Number(_this.data.statusCode);
        }
        return _this;
    }
    return ResponseError;
}(BaseError));
exports.ResponseError = ResponseError;
var UnretryableError = /** @class */ (function (_super) {
    __extends(UnretryableError, _super);
    function UnretryableError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'UnretryableError';
        return _this;
    }
    return UnretryableError;
}(Error));
var RetryError = /** @class */ (function (_super) {
    __extends(RetryError, _super);
    function RetryError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'RetryError';
        return _this;
    }
    return RetryError;
}(Error));
function retryError(request, response) {
    var e = new RetryError('');
    e.data = {
        request: request,
        response: response
    };
    return e;
}
exports.retryError = retryError;
function newError(data) {
    return new ResponseError(data);
}
exports.newError = newError;
function newUnretryableError(ctx) {
    if (ctx instanceof retry_1.RetryPolicyContext && ctx.exception) {
        return ctx.exception;
    }
    else {
        var e = new UnretryableError('');
        e.data = {
            lastRequest: ctx
        };
        return e;
    }
}
exports.newUnretryableError = newUnretryableError;
//# sourceMappingURL=error.js.map