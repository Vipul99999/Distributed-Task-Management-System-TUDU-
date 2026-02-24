import { createLogger, format, transports } from "winston";
import { env } from "./env";

const logger = createLogger({
  level: env.LOG_LEVEL,

  format: format.combine(
    format.timestamp(),

    env.NODE_ENV === "development"
      ? format.colorize()
      : format.uncolorize(),

    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),

  transports: [
    new transports.Console(),

    ...(env.NODE_ENV === "production"
      ? [new transports.File({ filename: "app.log" })]
      : []),
  ],
});

export { logger };