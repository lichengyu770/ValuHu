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
exports.FileFormStream = void 0;
var stream_1 = require("stream");
var querystring_1 = require("querystring");
var FileFormStream = /** @class */ (function (_super) {
    __extends(FileFormStream, _super);
    function FileFormStream(form, boundary) {
        var _this = _super.call(this) || this;
        _this.form = form;
        _this.keys = Object.keys(form);
        _this.index = 0;
        _this.boundary = boundary;
        _this.streaming = false;
        return _this;
    }
    FileFormStream.prototype._read = function () {
        var _this = this;
        if (this.streaming) {
            return;
        }
        var separator = this.boundary;
        if (this.index < this.keys.length) {
            var name_1 = this.keys[this.index];
            var fieldValue = this.form[name_1];
            if (typeof fieldValue.filename === 'string' &&
                typeof fieldValue.contentType === 'string' &&
                fieldValue.content instanceof stream_1.Readable) {
                var body = "--".concat(separator, "\r\n") +
                    "Content-Disposition: form-data; name=\"".concat(name_1, "\"; filename=\"").concat(fieldValue.filename, "\"\r\n") +
                    "Content-Type: ".concat(fieldValue.contentType, "\r\n\r\n");
                this.push(Buffer.from(body));
                this.streaming = true;
                fieldValue.content.on('data', function (chunk) {
                    _this.push(chunk);
                });
                fieldValue.content.on('end', function () {
                    _this.index++;
                    _this.streaming = false;
                    _this.push('');
                });
            }
            else {
                this.push(Buffer.from("--".concat(separator, "\r\n") +
                    "Content-Disposition: form-data; name=\"".concat(name_1, "\"\r\n\r\n") +
                    "".concat(fieldValue, "\r\n")));
                this.index++;
            }
        }
        else {
            this.push(Buffer.from("\r\n--".concat(separator, "--\r\n")));
            this.push(null);
        }
    };
    return FileFormStream;
}(stream_1.Readable));
exports.FileFormStream = FileFormStream;
var Form = /** @class */ (function () {
    function Form() {
    }
    Form.getBoundary = function () {
        return 'boundary' + Math.random().toString(16).slice(-12);
    };
    Form.toFileForm = function (form, boundary) {
        return new FileFormStream(form, boundary);
    };
    Form.toFormString = function (data) {
        return (0, querystring_1.stringify)(data);
    };
    return Form;
}());
exports.default = Form;
//# sourceMappingURL=form.js.map