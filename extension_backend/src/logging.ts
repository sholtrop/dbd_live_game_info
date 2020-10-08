import { createLogger, transports, format } from "winston";

const logFormat = format.printf((info) => {
  const date = new Date().toISOString();
  return `${date}-${info.level}: ${JSON.stringify(info.message, null, 4)}`;
});

const log = createLogger({
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      format: format.combine(format.colorize(), logFormat),
    }),
  ],
});

if (process.env.NODE_ENV === "test") log.silent = true;

export { log };
