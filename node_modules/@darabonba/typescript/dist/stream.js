"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSEEvent = void 0;
var DATA_PREFIX = 'data:';
var EVENT_PREFIX = 'event:';
var ID_PREFIX = 'id:';
var RETRY_PREFIX = 'retry:';
function isDigitsOnly(str) {
    for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i);
        if (c < '0' || c > '9') {
            return false;
        }
    }
    return str.length > 0;
}
var SSEEvent = /** @class */ (function () {
    function SSEEvent(data) {
        if (data === void 0) { data = {}; }
        this.data = data.data;
        this.id = data.id;
        this.event = data.event;
        this.retry = data.retry;
    }
    return SSEEvent;
}());
exports.SSEEvent = SSEEvent;
function read(readable) {
    return new Promise(function (resolve, reject) {
        var onData, onError, onEnd;
        var cleanup = function () {
            // cleanup
            readable.removeListener('error', onError);
            readable.removeListener('data', onData);
            readable.removeListener('end', onEnd);
        };
        var bufs = [];
        var size = 0;
        onData = function (buf) {
            bufs.push(buf);
            size += buf.length;
        };
        onError = function (err) {
            cleanup();
            reject(err);
        };
        onEnd = function () {
            cleanup();
            resolve(Buffer.concat(bufs, size));
        };
        readable.on('error', onError);
        readable.on('data', onData);
        readable.on('end', onEnd);
    });
}
function readyToRead(readable) {
    return new Promise(function (resolve, reject) {
        var onReadable, onEnd, onError;
        var cleanup = function () {
            // cleanup
            readable.removeListener('error', onError);
            readable.removeListener('end', onEnd);
            readable.removeListener('readable', onReadable);
        };
        onReadable = function () {
            cleanup();
            resolve(false);
        };
        onEnd = function () {
            cleanup();
            resolve(true);
        };
        onError = function (err) {
            cleanup();
            reject(err);
        };
        readable.once('readable', onReadable);
        readable.once('end', onEnd);
        readable.once('error', onError);
    });
}
function tryGetEvents(head, chunk) {
    var all = head + chunk;
    var start = 0;
    var events = [];
    var _loop_1 = function (i) {
        var c = all[i];
        var c2 = all[i + 1];
        if (c === '\n' && c2 === '\n') {
            var part = all.substring(start, i);
            var lines = part.split('\n');
            var event_1 = new SSEEvent();
            lines.forEach(function (line) {
                if (line.startsWith(DATA_PREFIX)) {
                    event_1.data = line.substring(DATA_PREFIX.length).trim();
                }
                else if (line.startsWith(EVENT_PREFIX)) {
                    event_1.event = line.substring(EVENT_PREFIX.length).trim();
                }
                else if (line.startsWith(ID_PREFIX)) {
                    event_1.id = line.substring(ID_PREFIX.length).trim();
                }
                else if (line.startsWith(RETRY_PREFIX)) {
                    var retry = line.substring(RETRY_PREFIX.length).trim();
                    if (isDigitsOnly(retry)) {
                        event_1.retry = parseInt(retry, 10);
                    }
                }
                else if (line.startsWith(':')) {
                    // ignore the line
                }
            });
            events.push(event_1);
            start = i + 2;
        }
    };
    for (var i = 0; i < all.length - 1; i++) {
        _loop_1(i);
    }
    var remain = all.substring(start);
    return { events: events, remain: remain };
}
var TeaStream = /** @class */ (function () {
    function TeaStream() {
    }
    TeaStream.readAsBytes = function (stream) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, read(stream)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TeaStream.readAsString = function (stream) {
        return __awaiter(this, void 0, void 0, function () {
            var buff;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TeaStream.readAsBytes(stream)];
                    case 1:
                        buff = _a.sent();
                        return [2 /*return*/, buff.toString()];
                }
            });
        });
    };
    TeaStream.readAsJSON = function (stream) {
        return __awaiter(this, void 0, void 0, function () {
            var str;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, TeaStream.readAsString(stream)];
                    case 1:
                        str = _a.sent();
                        return [2 /*return*/, JSON.parse(str)];
                }
            });
        });
    };
    TeaStream.readAsSSE = function (stream) {
        return __asyncGenerator(this, arguments, function readAsSSE_1() {
            var rest, ended, chunk, _a, events, remain, _i, events_1, event_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        rest = '';
                        _b.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 12];
                        return [4 /*yield*/, __await(readyToRead(stream))];
                    case 2:
                        ended = _b.sent();
                        if (!ended) return [3 /*break*/, 4];
                        return [4 /*yield*/, __await(void 0)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        chunk = void 0;
                        _b.label = 5;
                    case 5:
                        if (!(null !== (chunk = stream.read()))) return [3 /*break*/, 11];
                        _a = tryGetEvents(rest, chunk.toString()), events = _a.events, remain = _a.remain;
                        rest = remain;
                        if (!(events && events.length > 0)) return [3 /*break*/, 10];
                        _i = 0, events_1 = events;
                        _b.label = 6;
                    case 6:
                        if (!(_i < events_1.length)) return [3 /*break*/, 10];
                        event_2 = events_1[_i];
                        return [4 /*yield*/, __await(event_2)];
                    case 7: return [4 /*yield*/, _b.sent()];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 6];
                    case 10: return [3 /*break*/, 5];
                    case 11: return [3 /*break*/, 1];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    return TeaStream;
}());
exports.default = TeaStream;
//# sourceMappingURL=stream.js.map