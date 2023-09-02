/* eslint-disable */
// cspell:ignore twinston
import { createWriteStream } from "node:fs";
import twinston from "./server/node_modules/winston";

export function createLogger(
    winston: any,
    streamPath: string | undefined,
    logLevel?: string,
): typeof twinston {
    if (!streamPath) {
        return winston.createLogger({
            // we must provide at least one logger or winston cries
            transports: new winston.transports.Console({ silent: true }),
        });
    }

    const stream = createWriteStream(streamPath);

    return winston.createLogger({
        // error: 0,
        // warn: 1,
        // info: 2,
        // http: 3,
        // verbose: 4,
        // debug: 5,
        // silly: 6
        level: logLevel ?? "silly",
        transports: [
            new winston.transports.Stream({
                stream,
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: "HH:mm:ss" }),
                    winston.format.printf((info: any) => `${info.level} ${info["timestamp"]}`),
                ),
            }),
            new winston.transports.Stream({
                stream,
                format: winston.format.combine(
                    winston.format.errors({ stack: true }),
                    winston.format.prettyPrint({
                        colorize: true,
                        depth: 4,
                    }),
                ),
            }),
        ],
    });
}
