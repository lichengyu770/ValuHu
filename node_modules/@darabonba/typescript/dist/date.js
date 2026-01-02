"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
var TeaDate = /** @class */ (function () {
    function TeaDate(date) {
        this.date = (0, moment_1.default)(date);
    }
    TeaDate.prototype.format = function (layout) {
        layout = layout.replace(/y/g, 'Y')
            .replace(/d/g, 'D').replace(/h/g, 'H')
            .replace(/a/g, 'A').replace(/E/g, 'd');
        return this.date.format(layout);
    };
    TeaDate.prototype.unix = function () {
        return this.date.unix();
    };
    TeaDate.prototype.sub = function (amount, unit) {
        var date = (0, moment_1.default)(this.date).subtract(unit, amount);
        return new TeaDate(date);
    };
    TeaDate.prototype.add = function (amount, unit) {
        var date = (0, moment_1.default)(this.date).add(unit, amount);
        return new TeaDate(date);
    };
    TeaDate.prototype.diff = function (amount, diffDate) {
        return this.date.diff(diffDate.date, amount);
    };
    TeaDate.prototype.hour = function () {
        return this.date.hour();
    };
    TeaDate.prototype.minute = function () {
        return this.date.minute();
    };
    TeaDate.prototype.second = function () {
        return this.date.second();
    };
    TeaDate.prototype.month = function () {
        return this.date.month() + 1;
    };
    TeaDate.prototype.year = function () {
        return this.date.year();
    };
    TeaDate.prototype.dayOfMonth = function () {
        return this.date.date();
    };
    TeaDate.prototype.dayOfWeek = function () {
        var weekday = this.date.weekday();
        if (weekday === 0) {
            // sunday
            return 7;
        }
        return weekday + 1;
    };
    TeaDate.prototype.weekOfMonth = function () {
        var startWeek = (0, moment_1.default)(this.date).startOf('month').week();
        var dateWeek = this.date.week();
        if (this.date.weekday() === 0) {
            dateWeek = dateWeek - 1;
        }
        if (dateWeek === 0 && this.date.date() > 1) {
            // the last day of this year is sunday
            return this.sub('day', 1).weekOfMonth();
        }
        var monthWeek = dateWeek - startWeek;
        if (monthWeek < 0) {
            // start of a new year
            return 1;
        }
        return monthWeek + 1;
    };
    TeaDate.prototype.weekOfYear = function () {
        var weekday = this.date.weekday();
        var week = this.date.week();
        if (weekday === 0 && week === 1 && this.date.date() > 1) {
            // the last day of this year is sunday
            return this.sub('day', 1).weekOfYear();
        }
        return this.date.week();
    };
    return TeaDate;
}());
exports.default = TeaDate;
//# sourceMappingURL=date.js.map