"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionCredentialProvider = exports.Session = exports.STALE_TIME = void 0;
const time_1 = require("./time");
const utils_1 = require("../util/utils");
const credentials_1 = __importDefault(require("../credentials"));
exports.STALE_TIME = 15 * 60;
class Session {
    constructor(accessKeyId, accessKeySecret, securityToken, expiration) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.securityToken = securityToken;
        this.expiration = expiration;
    }
}
exports.Session = Session;
class SessionCredentialProvider {
    constructor(staleTime = 0, prefetchTime = 0) {
        this.staleTime = staleTime || exports.STALE_TIME;
        if (prefetchTime) {
            this.prefetchTime = prefetchTime;
            this.prefetchTimestamp = Date.now() + (prefetchTime * 1000);
        }
        this.refreshFaliure = 0;
    }
    async getCredentials() {
        this.session = await this.getSession();
        return credentials_1.default.builder()
            .withAccessKeyId(this.session.accessKeyId)
            .withAccessKeySecret(this.session.accessKeySecret)
            .withSecurityToken(this.session.securityToken)
            .withProviderName(this.getProviderName())
            .build();
    }
    refreshTimestamp() {
        this.staleTimestamp = this.expirationTimestamp - this.staleTime;
        if (this.prefetchTimestamp) {
            this.prefetchTimestamp = (Date.now() + (this.prefetchTime * 1000)) / 1000;
        }
    }
    maxStaleFailureJitter() {
        const exponentialBackoffMillis = (1 << (this.refreshFaliure - 1));
        return exponentialBackoffMillis > 10 ? exponentialBackoffMillis : 10;
    }
    jitterTime(time, jitterStart, jitterEnd) {
        const jitterRange = jitterEnd - jitterStart;
        const jitterAmount = Math.abs(Math.floor(Math.random() * jitterRange));
        return time + jitterStart + jitterAmount;
    }
    async refreshSession() {
        try {
            const session = await this.refresher();
            const now = Date.now() / 1000;
            const oldSessionAvailable = this.staleTimestamp > now;
            const oldSession = this.session;
            this.expirationTimestamp = (0, time_1.parseUTC)(session.expiration) / 1000;
            this.session = session;
            this.refreshFaliure = 0;
            this.refreshTimestamp();
            // 过期时间大于15分钟，不用管
            if (this.staleTimestamp > now) {
                return;
            }
            // 不足或等于15分钟，但未过期，下次会再次刷新
            if (now < (this.staleTimestamp + this.staleTime)) {
                this.expirationTimestamp = now + this.staleTime;
            }
            // 已过期，看缓存，缓存若大于15分钟，返回缓存，若小于15分钟，则根据策略判断是立刻重试还是稍后重试
            if (now > (this.staleTimestamp + this.staleTime)) {
                if (oldSessionAvailable) {
                    this.session = oldSession;
                    this.expirationTimestamp = (0, time_1.parseUTC)(oldSession.expiration) / 1000;
                    this.refreshTimestamp();
                    return;
                }
                const waitUntilNextRefresh = 50 + (0, utils_1.getRandomInt)(20);
                this.expirationTimestamp = now + waitUntilNextRefresh + this.staleTime;
            }
        }
        catch (err) {
            if (!this.session) {
                throw err;
            }
            const now = Date.now() / 1000;
            if (now < this.staleTimestamp) {
                return;
            }
            this.refreshFaliure++;
            this.expirationTimestamp = this.jitterTime(now, 1, this.maxStaleFailureJitter()) + this.staleTime;
        }
    }
    async getSession() {
        if (this.needUpdateCredential() || this.shouldPrefetchCredential()) {
            await this.refreshSession();
            this.refreshTimestamp();
        }
        return this.session;
    }
    needUpdateCredential() {
        if (!this.session || !this.expirationTimestamp) {
            return true;
        }
        return (Date.now() / 1000) >= this.staleTimestamp;
    }
    shouldPrefetchCredential() {
        if (!this.prefetchTimestamp) {
            return false;
        }
        return this.expirationTimestamp - (Date.now() / 1000) <= this.prefetchTime;
    }
    getProviderName() {
        return 'session';
    }
}
exports.SessionCredentialProvider = SessionCredentialProvider;
//# sourceMappingURL=session.js.map