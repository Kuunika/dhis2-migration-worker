"use strict";
exports.__esModule = true;
var winston = require("winston");
var createLogger = winston.createLogger, format = winston.format, transports = winston.transports;
var Logger = /** @class */ (function () {
    function Logger(channelId) {
        this.channelId = channelId;
        this._logger = createLogger({
            level: 'info',
            format: format.combine(format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }), format.errors({ stack: true }), format.splat(), format.json()),
            defaultMeta: { service: 'DHIS2-migration-worker' },
            transports: [
                new transports.File({ filename: "./logs/" + channelId + "-error.log", level: 'error' }),
                new transports.File({ filename: "./logs/" + channelId + "-combined.log" })
            ]
        });
        if (process.env.NODE_ENV !== 'production') {
            this._logger.add(new transports.Console({
                format: format.combine(format.colorize(), format.simple())
            }));
        }
    }
    Logger.prototype.info = function (message) {
        this._logger.info(message);
    };
    Logger.prototype.error = function (message) {
        this._logger.error(message);
    };
    return Logger;
}());
exports.Logger = Logger;
