"use strict";
// This file is auto-generated, don't edit it
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is a array module
 */
class Client {
    // 按照起止坐标截取数组
    static split(raw, index, limit) {
        return raw.slice(index, index + limit);
    }
    // 判断数组是否包含指定字符串
    static contains(raw, str) {
        if (null === raw || typeof (raw) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        return raw.includes(str);
    }
    // 返回指定字符串在数组中的下标，如果不存在返回 -1
    static index(raw, str) {
        if (null === raw || typeof (raw) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        return raw.indexOf(str);
    }
    // 返回数组长度
    static size(raw) {
        if (null === raw || typeof (raw) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        return raw.length;
    }
    // 根据下标获取数组中的字符串元素
    static get(raw, index) {
        if (null === raw || typeof (raw) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        return raw[index];
        throw new Error('Un-implemented!');
    }
    // 数组合并成字符串，并添加指定的间隔字符串
    static join(raw, sep) {
        if (null === raw || typeof (raw) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        return raw.join(sep);
        throw new Error('Un-implemented!');
    }
    // 合并两个字符串数组，并返回
    static concat(raw, sep) {
        if (null === raw || typeof (raw) === 'undefined' || null === sep || typeof (sep) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        return raw.concat(sep);
    }
    // 数组排序，升序
    static ascSort(raw) {
        if (null === raw || typeof (raw) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        return raw.sort();
    }
    // 数组排序，降序
    static descSort(raw) {
        if (null === raw || typeof (raw) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        raw.sort(function (a, b) { return b.localeCompare(a); });
        return raw;
    }
    /**
     * append any array item
     */
    static append(array, item) {
        if (null !== array && Array.isArray(array)) {
            array.push(item);
        }
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map