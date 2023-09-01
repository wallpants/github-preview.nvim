import { createWriteStream } from "node:fs";
import winston from "winston";
import { ENV } from "../../env";

// ENV vars are set by neovim after we start
// neovim with "pnpm vi" at project root
const stream =
    ENV.LSP_SERVER_STREAM && createWriteStream(ENV.LSP_SERVER_STREAM);

export const logger = winston.createLogger({
    level: ENV.LSP_LOG_LEVEL ?? "silly",
    transports: stream
        ? [
              new winston.transports.Stream({
                  stream,
                  format: winston.format.combine(
                      winston.format.colorize(),
                      winston.format.timestamp({ format: "HH:mm:ss" }),
                      winston.format.printf(
                          (info) => `${info.level} ${info["timestamp"]}`,
                      ),
                  ),
              }),
              new winston.transports.Stream({
                  stream,
                  format: winston.format.combine(
                      winston.format.prettyPrint({
                          colorize: true,
                          depth: 4,
                      }),
                  ),
              }),
          ]
        : // at least one transport is required
          new winston.transports.Console({ silent: true }),
});
