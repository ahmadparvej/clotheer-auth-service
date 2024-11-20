import winston from "winston";
import { Config } from "./index";

const logger = winston.createLogger({
  level: "info",
  defaultMeta: { service: "auth-service" },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.prettyPrint(),
  ),
  transports: [
    new winston.transports.File({
      filename: "combined.log",
      level: "info",
      dirname: "./logs",
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      dirname: "./logs",
      silent: Config.NODE_ENV === "test",
    }),
    new winston.transports.Console({
      level: "info",
      silent: Config.NODE_ENV === "test",
    }),
  ],
});

export default logger;
