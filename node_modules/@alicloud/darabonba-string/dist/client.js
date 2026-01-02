"use strict";
// This file is auto-generated, don't edit it
/**
 * This is a string module
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    static split(raw, sep, limit) {
        if (null === limit || typeof (limit) === 'undefined' || limit < 1) {
            return raw.split(sep);
        }
        let result = raw.split(sep, limit);
        if (result.length >= limit) {
            result[limit - 1] = [result[limit - 1], ...raw.split(sep).splice(limit)].join(sep);
        }
        return result;
    }
    static replace(raw, oldStr, newStr, count = null) {
        if (null === count || typeof (count) === 'undefined' || count < 0) {
            return raw.split(oldStr).join(newStr);
        }
        let tmp = raw.split(oldStr);
        if (count >= tmp.length - 1) {
            return raw.split(oldStr).join(newStr);
        }
        let left = tmp.slice(0, count + 1).join(newStr);
        let right = tmp.slice(count + 1).join(oldStr);
        return left + oldStr + right;
    }
    static contains(s, substr) {
        return s.indexOf(substr) !== -1;
    }
    static count(s, substr) {
        return s.split(substr).length;
    }
    static hasPrefix(s, prefix) {
        return s.startsWith(prefix);
    }
    static hasSuffix(s, substr) {
        return s.endsWith(substr);
    }
    static index(s, substr) {
        return s.indexOf(substr);
    }
    static toLower(s) {
        return s.toLowerCase();
    }
    static toUpper(s) {
        return s.toUpperCase();
    }
    static subString(s, strat, end) {
        return s.slice(strat, end);
    }
    static equals(expect, actual) {
        return expect === actual;
    }
    static trim(str) {
        return str.trim();
    }
    static toBytes(str, encoding) {
        return Buffer.from(str, encoding);
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map