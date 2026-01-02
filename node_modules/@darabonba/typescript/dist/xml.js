"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This file is auto-generated, don't edit it
var xml2js_1 = require("xml2js");
var TeaXML = /** @class */ (function () {
    function TeaXML() {
    }
    TeaXML.parseXml = function (body, response) {
        var ret = this._parseXML(body);
        if (response !== null && typeof response !== 'undefined') {
            ret = this._xmlCast(ret, response);
        }
        return ret;
    };
    TeaXML.toXML = function (body) {
        var builder = new xml2js_1.Builder();
        return builder.buildObject(body);
    };
    TeaXML._parseXML = function (body) {
        var parser = new xml2js_1.Parser({ explicitArray: false });
        var result = {};
        parser.parseString(body, function (err, output) {
            result.err = err;
            result.output = output;
        });
        if (result.err) {
            throw result.err;
        }
        return result.output;
    };
    TeaXML._xmlCast = function (obj, clazz) {
        var _this = this;
        obj = obj || {};
        var ret = {};
        var clz = clazz;
        var names = clz.names();
        var types = clz.types();
        Object.keys(names).forEach(function (key) {
            var originName = names[key];
            var value = obj[originName];
            var type = types[key];
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
                            ret[originName] = value.map(function (d) {
                                return _this._xmlCast(d, type.itemType);
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
                        ret[originName] = _this._xmlCast(value, type);
                    }
                    else {
                        ret[originName] = value;
                    }
            }
        });
        return ret;
    };
    return TeaXML;
}());
exports.default = TeaXML;
//# sourceMappingURL=xml.js.map