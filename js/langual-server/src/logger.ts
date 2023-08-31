import { createWriteStream } from "node:fs";
import winston from "winston";
import { ENV } from "../../env";

export const logger = winston.createLogger({
    level: ENV.LSP_LOG_LEVEL ?? "silly",
    transports: [
        ENV.LSP_SERVER_STREAM
            ? new winston.transports.Stream({
                  stream: createWriteStream(ENV.LSP_SERVER_STREAM),
                  format: winston.format.combine(
                      winston.format.colorize(),
                      winston.format.cli(),
                  ),
              })
            : // at least one transport is required
              new winston.transports.Console({ silent: true }),
    ],
});
