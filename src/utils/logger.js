import winston from "winston";
import { existsSync, mkdirSync } from "fs";

if (process.env.LOG_ENV !== "vercel") {
  if (!existsSync("logs")) {
    mkdirSync("logs", { recursive: true });
  }
}

const transports = [
  new winston.transports.Console(), 
];

if (process.env.LOG_ENV !== "vercel") {
  transports.push(
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports,
});

export default logger;
