"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml2js_1 = require("xml2js");
class Client {
    static parseXml(body, response) {
        let ret = this._parseXML(body);
        if (response !== null && typeof response !== 'undefined') {
            ret = this._xmlCast(ret, response);
        }
        return ret;
    }
    static toXML(body) {
        const builder = new xml2js_1.Builder();
        return builder.buildObject(body);
    }
    static _parseXML(body) {
        let parser = new xml2js_1.Parser({ explicitArray: false });
        let result = {};
        parser.parseString(body, function (err, output) {
            result.err = err;
            result.output = output;
        });
        if (result.err) {
            throw result.err;
        }
        return result.output;
    }
    static _xmlCast(obj, clazz) {
        obj = obj || {};
        let ret = {};
        let clz = clazz;
        let names = clz.names();
        let types = clz.types();
        Object.keys(names).forEach((key) => {
            let originName = names[key];
            let value = obj[originName];
            let type = types[key];
            switch (type) {
                case 'boolean':
                    if (!value) {
                        ret[originName] = false;
                        return;
                    }
                    ret[originName] = value === 'false' ? false : true;
                    return;
                case 'number':
                    if (value != 0 && !value) {
                        ret[originName] = NaN;
                        return;
                    }
                    ret[originName] = +value;
                    return;
                case 'string':
                    if (!value) {
                        ret[originName] = '';
                        return;
                    }
                    ret[originName] = value.toString();
                    return;
                default:
                    if (type.type === 'array') {
                        if (!value) {
                            ret[originName] = [];
                            return;
                        }
                        if (!Array.isArray(value)) {
                            value = [value];
                        }
                        if (typeof type.itemType === 'function') {
                            ret[originName] = value.map((d) => {
                                return this._xmlCast(d, type.itemType);
                            });
                        }
                        else {
                            ret[originName] = value;
                        }
                    }
                    else if (typeof type === 'function') {
                        if (!value) {
                            value = {};
                        }
                        ret[originName] = this._xmlCast(value, type);
                    }
                    else {
                        ret[originName] = value;
                    }
            }
        });
        return ret;
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map