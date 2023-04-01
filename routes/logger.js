const { createLogger, transports, format } = require("winston");
require("winston-daily-rotate-file");

const timezoned = () => {
  return new Date().toLocaleString("en-US",    );
};

const fileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/rotate-%DATE%.log",
  datePattern: "DD-MM-YYYY",
  maxFiles: "7d",
  level: "info",
  format: format.combine(
    format.timestamp({ format: timezoned }),
    format.json()
  ),
});

const fileUsersTransport = new transports.DailyRotateFile({
  filename: "logs/users-rotate-%DATE%.log",
  datePattern: "DD-MM-YYYY",
  maxFiles: "7d",
  level: "info",
  format: format.combine(
    format.timestamp({ format: timezoned }),
    format.json()
  ),
});


const errorfileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/rotate-error-%DATE%.log",
  datePattern: "DD-MM-YYYY",
  maxFiles: "7d",
  level: "error",
  format: format.combine(
    format.timestamp({ format: timezoned }),
    format.json()
  ),
});


const counsellingLogger = createLogger({
  transports: [
    fileRotateTransport,
    new transports.Console(),

    errorfileRotateTransport,
    new transports.Console(),
  ],
});

const UserLogger = createLogger({
  transports: [
    fileUsersTransport,
    new transports.Console(),
  ],
});

module.exports = { counsellingLogger };
