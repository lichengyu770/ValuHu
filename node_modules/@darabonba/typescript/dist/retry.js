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
exports.getBackoffDelay = exports.shouldRetry = exports.RetryPolicyContext = exports.RetryOptions = exports.RetryCondition = exports.BackoffPolicy = void 0;
var MAX_DELAY_TIME = 120 * 1000;
var MIN_DELAY_TIME = 100;
var BackoffPolicy = /** @class */ (function () {
    function BackoffPolicy(option) {
        this.policy = option.policy;
    }
    BackoffPolicy.prototype.getDelayTime = function (ctx) {
        throw Error('un-implement');
    };
    BackoffPolicy.newBackoffPolicy = function (option) {
        switch (option.policy) {
            case 'Fixed':
                return new FixedBackoffPolicy(option);
            case 'Random':
                return new RandomBackoffPolicy(option);
            case 'Exponential':
                return new ExponentialBackoffPolicy(option);
            case 'EqualJitter':
            case 'ExponentialWithEqualJitter':
                return new EqualJitterBackoffPolicy(option);
            case 'FullJitter':
            case 'ExponentialWithFullJitter':
                return new FullJitterBackoffPolicy(option);
        }
    };
    return BackoffPolicy;
}());
exports.BackoffPolicy = BackoffPolicy;
var FixedBackoffPolicy = /** @class */ (function (_super) {
    __extends(FixedBackoffPolicy, _super);
    function FixedBackoffPolicy(option) {
        var _this = _super.call(this, option) || this;
        _this.period = option.period;
        return _this;
    }
    FixedBackoffPolicy.prototype.getDelayTime = function (ctx) {
        return this.period;
    };
    return FixedBackoffPolicy;
}(BackoffPolicy));
var RandomBackoffPolicy = /** @class */ (function (_super) {
    __extends(RandomBackoffPolicy, _super);
    function RandomBackoffPolicy(option) {
        var _this = _super.call(this, option) || this;
        _this.period = option.period;
        _this.cap = option.cap || 20 * 1000;
        return _this;
    }
    RandomBackoffPolicy.prototype.getDelayTime = function (ctx) {
        var randomTime = Math.floor(Math.random() * (ctx.retriesAttempted * this.period));
        if (randomTime > this.cap) {
            return this.cap;
        }
        return randomTime;
    };
    return RandomBackoffPolicy;
}(BackoffPolicy));
var ExponentialBackoffPolicy = /** @class */ (function (_super) {
    __extends(ExponentialBackoffPolicy, _super);
    function ExponentialBackoffPolicy(option) {
        var _this = _super.call(this, option) || this;
        _this.period = option.period;
        //default value: 3 days
        _this.cap = option.cap || 3 * 24 * 60 * 60 * 1000;
        return _this;
    }
    ExponentialBackoffPolicy.prototype.getDelayTime = function (ctx) {
        var randomTime = Math.pow(2, ctx.retriesAttempted * this.period);
        if (randomTime > this.cap) {
            return this.cap;
        }
        return randomTime;
    };
    return ExponentialBackoffPolicy;
}(BackoffPolicy));
var EqualJitterBackoffPolicy = /** @class */ (function (_super) {
    __extends(EqualJitterBackoffPolicy, _super);
    function EqualJitterBackoffPolicy(option) {
        var _this = _super.call(this, option) || this;
        _this.period = option.period;
        //default value: 3 days
        _this.cap = option.cap || 3 * 24 * 60 * 60 * 1000;
        return _this;
    }
    EqualJitterBackoffPolicy.prototype.getDelayTime = function (ctx) {
        var ceil = Math.min(this.cap, Math.pow(2, ctx.retriesAttempted * this.period));
        return ceil / 2 + Math.floor(Math.random() * (ceil / 2 + 1));
    };
    return EqualJitterBackoffPolicy;
}(BackoffPolicy));
var FullJitterBackoffPolicy = /** @class */ (function (_super) {
    __extends(FullJitterBackoffPolicy, _super);
    function FullJitterBackoffPolicy(option) {
        var _this = _super.call(this, option) || this;
        _this.period = option.period;
        //default value: 3 days
        _this.cap = option.cap || 3 * 24 * 60 * 60 * 1000;
        return _this;
    }
    FullJitterBackoffPolicy.prototype.getDelayTime = function (ctx) {
        var ceil = Math.min(this.cap, Math.pow(2, ctx.retriesAttempted * this.period));
        return Math.floor(Math.random() * ceil);
    };
    return FullJitterBackoffPolicy;
}(BackoffPolicy));
var RetryCondition = /** @class */ (function () {
    function RetryCondition(condition) {
        this.maxAttempts = condition.maxAttempts;
        this.backoff = condition.backoff && BackoffPolicy.newBackoffPolicy(condition.backoff);
        this.exception = condition.exception;
        this.errorCode = condition.errorCode;
        this.maxDelay = condition.maxDelay;
    }
    return RetryCondition;
}());
exports.RetryCondition = RetryCondition;
var RetryOptions = /** @class */ (function () {
    function RetryOptions(options) {
        this.retryable = options.retryable;
        this.retryCondition = (options.retryCondition || []).map(function (condition) {
            return new RetryCondition(condition);
        });
        this.noRetryCondition = (options.noRetryCondition || []).map(function (condition) {
            return new RetryCondition(condition);
        });
    }
    return RetryOptions;
}());
exports.RetryOptions = RetryOptions;
var RetryPolicyContext = /** @class */ (function () {
    function RetryPolicyContext(options) {
        this.key = options.key;
        this.retriesAttempted = options.retriesAttempted || 0;
        this.httpRequest = options.httpRequest || null;
        this.httpResponse = options.httpResponse || null;
        this.exception = options.exception || null;
    }
    return RetryPolicyContext;
}());
exports.RetryPolicyContext = RetryPolicyContext;
function shouldRetry(options, ctx) {
    if (ctx.retriesAttempted === 0) {
        return true;
    }
    if (!options || !options.retryable) {
        return false;
    }
    var retriesAttempted = ctx.retriesAttempted;
    var ex = ctx.exception;
    var conditions = options.noRetryCondition;
    for (var i = 0; i < conditions.length; i++) {
        var condition = conditions[i];
        if (condition.exception.includes(ex.name) || condition.errorCode.includes(ex.code)) {
            return false;
        }
    }
    conditions = options.retryCondition;
    for (var i = 0; i < conditions.length; i++) {
        var condition = conditions[i];
        if (!condition.exception.includes(ex.name) && !condition.errorCode.includes(ex.code)) {
            continue;
        }
        if (retriesAttempted >= condition.maxAttempts) {
            return false;
        }
        return true;
    }
    return false;
}
exports.shouldRetry = shouldRetry;
function getBackoffDelay(options, ctx) {
    var ex = ctx.exception;
    var conditions = options.retryCondition;
    for (var i = 0; i < conditions.length; i++) {
        var condition = conditions[i];
        if (!condition.exception.includes(ex.name) && !condition.errorCode.includes(ex.code)) {
            continue;
        }
        var maxDelay = condition.maxDelay || MAX_DELAY_TIME;
        var retryAfter = ctx.exception.retryAfter;
        if (retryAfter !== undefined) {
            return Math.min(retryAfter, maxDelay);
        }
        if (!condition.backoff) {
            return MIN_DELAY_TIME;
        }
        return Math.min(condition.backoff.getDelayTime(ctx), maxDelay);
    }
    return MIN_DELAY_TIME;
}
exports.getBackoffDelay = getBackoffDelay;
//# sourceMappingURL=retry.js.map