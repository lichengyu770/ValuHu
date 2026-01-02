"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    // 返回对象长度
    static size(raw) {
        if (null === raw || typeof (raw) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        return Object.keys(raw).length;
    }
    // 返回由对象key组成的数组
    static keySet(raw) {
        if (null === raw || typeof (raw) === 'undefined') {
            throw new Error('not a valid value for parameter');
        }
        return Object.keys(raw);
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map