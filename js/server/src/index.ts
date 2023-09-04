import ipc from "node-ipc";
import { createServer } from "node:http";
import { type Socket } from "node:net";
import opener from "opener";
import { parse } from "valibot";
import { WebSocketServer } from "ws";
import { ENV } from "../../env";
import { IPC_SERVER_ID, type IPC_EVENTS } from "./consts";
import { logger } from "./logger";
import { onHttpRequest } from "./on-http-request";
import { onWssConnection } from "./on-wss-connection";
import { PluginConfigSchema, type PluginConfig } from "./types";

ipc.config.id = IPC_SERVER_ID;
ipc.config.retry = 1500;
ipc.config.logger = (log) => logger.debug(log);

function main() {
    ipc.serve(function () {
        const updateConfig: (typeof IPC_EVENTS)[number] = "github-preview-update-config";
        // updateConfig event is first thing sent by client when connection opens
        ipc.server.on(updateConfig, function (config: PluginConfig, _socket: Socket) {
            try {
                ENV.GP_IS_DEV && parse(PluginConfigSchema, config);
                logger.verbose(updateConfig, { config });

                const httpServer = createServer();
                httpServer.on("request", onHttpRequest);

                const wsServer = new WebSocketServer({ server: httpServer });
                wsServer.on("connection", onWssConnection({ config, ipc }));

                const PORT = ENV.VITE_GP_PORT ?? config.port;

                httpServer.listen(PORT, () => {
                    logger.verbose(`Server is listening on port ${PORT}`);
                    !ENV.GP_IS_DEV && opener(`http://localhost:${PORT}`);
                });
            } catch (err) {
                logger.error("updateConfigEventHandler ERROR", err);
            }
        });
    });

    ipc.server.start();
}

try {
    main();
} catch (err) {
    logger.error("BOUNDARY ERROR", err);
}
