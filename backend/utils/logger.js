const path = require('path');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { format } = require('winston');

const logDir = path.join(__dirname, '../logs');

const excludeErrors = format((info) => {
    return info.level === 'error' ? false : info;
});

const normalLogTransport = new DailyRotateFile({
    dirname: logDir,
    filename: '%DATE%.log',
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: format.combine(
        excludeErrors(),
        format.timestamp(),
        format.json()
    )
});

const errorLogTransport = new DailyRotateFile({
    dirname: logDir,
    filename: 'error-%DATE%.log',
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
    format: format.combine(
        format.timestamp(),
        format.json(),
        format.errors({ stack: true })
    )
});

const logger = winston.createLogger({
    transports: [
        normalLogTransport,
        errorLogTransport
    ],
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    )
});

logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    )
}));

module.exports = logger;