import { createWriteStream } from "node:fs";
import winston from "winston";

const stream = createWriteStream(
    "/Users/gualcasas/Projects/nvim-plugins/github-preview.nvim/gualberto.logs",
);

export const logger = winston.createLogger({
    level: "silly",
    transports: [
        new winston.transports.Stream({
            stream,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: "HH:mm:ss" }),
                winston.format.printf((info) => `${info.level} ${info["timestamp"]}`),
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
    ],
});
