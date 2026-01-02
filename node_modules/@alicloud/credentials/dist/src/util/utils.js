"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomInt = exports.loadIni = exports.parseFile = exports.timestamp = void 0;
const ini = __importStar(require("ini"));
const kitx = __importStar(require("kitx"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const accessAsync = (0, util_1.promisify)(fs_1.default.access);
function timestamp(dateStr, timeChange) {
    let date = new Date(dateStr);
    if (!dateStr || isNaN(date.getTime())) {
        date = new Date();
    }
    if (timeChange) {
        date.setTime(date.getTime() + timeChange);
    }
    const YYYY = date.getUTCFullYear();
    const MM = kitx.pad2(date.getUTCMonth() + 1);
    const DD = kitx.pad2(date.getUTCDate());
    const HH = kitx.pad2(date.getUTCHours());
    const mm = kitx.pad2(date.getUTCMinutes());
    const ss = kitx.pad2(date.getUTCSeconds());
    // 删除掉毫秒部分
    return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}Z`;
}
exports.timestamp = timestamp;
function parseFile(file, ignoreErr = false) {
    // check read permission
    try {
        fs_1.default.accessSync(file, fs_1.default.constants.R_OK);
    }
    catch (e) {
        if (ignoreErr) {
            return null;
        }
        throw new Error('Has no read permission to credentials file');
    }
    return ini.parse(fs_1.default.readFileSync(file, 'utf-8'));
}
exports.parseFile = parseFile;
async function loadIni(filePath) {
    await accessAsync(filePath, fs_1.default.constants.R_OK);
    const content = await readFileAsync(filePath, 'utf-8');
    return ini.parse(content);
}
exports.loadIni = loadIni;
function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
}
exports.getRandomInt = getRandomInt;
//# sourceMappingURL=utils.js.map