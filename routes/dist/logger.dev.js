"use strict";

var _require = require("winston"),
    createLogger = _require.createLogger,
    transports = _require.transports,
    format = _require.format;

require("winston-daily-rotate-file");

var timezoned = function timezoned() {
  return new Date().toLocaleString("en-US");
};

var fileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/rotate-%DATE%.log",
  datePattern: "DD-MM-YYYY",
  maxFiles: "7d",
  level: "info",
  format: format.combine(format.timestamp({
    format: timezoned
  }), format.json())
});
var fileUsersTransport = new transports.DailyRotateFile({
  filename: "logs/users-rotate-%DATE%.log",
  datePattern: "DD-MM-YYYY",
  maxFiles: "7d",
  level: "info",
  format: format.combine(format.timestamp({
    format: timezoned
  }), format.json())
});
var errorfileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/rotate-error-%DATE%.log",
  datePattern: "DD-MM-YYYY",
  maxFiles: "7d",
  level: "error",
  format: format.combine(format.timestamp({
    format: timezoned
  }), format.json())
});
var counsellingLogger = createLogger({
  transports: [fileRotateTransport, new transports.Console(), errorfileRotateTransport, new transports.Console()]
});
var UserLogger = createLogger({
  transports: [fileUsersTransport, new transports.Console()]
});
module.exports = {
  counsellingLogger: counsellingLogger
};