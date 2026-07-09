const winston = require("winston");
const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}] ${stack || message}`;
    })
  ),

  transports: [
    new winston.transports.Console(),
  ],
});

if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    })
  );
}

module.exports = logger;