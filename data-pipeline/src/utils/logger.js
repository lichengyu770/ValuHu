// 日志工具

const winston = require('winston');
const path = require('path');

// 创建日志目录（如果不存在）
const logDir = path.join(__dirname, '../../../logs');
require('fs').mkdirSync(logDir, { recursive: true });

// 配置日志格式
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => {
        return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`;
    })
);

// 创建logger实例
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // 控制台日志
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        // 错误日志文件
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        }),
        // 所有日志文件
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        })
    ]
});

module.exports = logger;