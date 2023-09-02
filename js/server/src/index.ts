import ipc from "node-ipc";
import { createServer } from "node:http";
import { type Socket } from "node:net";
import opener from "opener";
import { WebSocketServer } from "ws";
import { ENV } from "../../env";
import { IPC_SERVER_ID, type IPC_EVENTS } from "./consts";
import { logger } from "./logger";
import { onHttpRequest } from "./on-http-request";
import { onWssConnection } from "./on-wss-connection";
import { PluginPropsSchema, type PluginProps } from "./types";
import { devSafeParse } from "./utils";

ipc.config.id = IPC_SERVER_ID;
ipc.config.retry = 1500;
ipc.config.maxConnections = 1;
ipc.config.logger = (log) => logger.verbose("IPC LOG", log);

function main() {
    ipc.serve(function () {
        const updateConfig: (typeof IPC_EVENTS)[number] = "github-preview-update-config";
        // updateConfig event is first thing sent when connection opens
        ipc.server.on(updateConfig, function (props: PluginProps, _socket: Socket) {
            devSafeParse(logger, PluginPropsSchema, props);
            logger.verbose(updateConfig, props);

            const httpServer = createServer();
            httpServer.on("request", onHttpRequest);

            const wsServer = new WebSocketServer({ server: httpServer });
            wsServer.on("connection", onWssConnection({ props, ipc }));

            const PORT = ENV.VITE_GP_PORT ?? props.port;

            !ENV.IS_DEV && opener(`http://localhost:${PORT}`);
            httpServer.listen(PORT, () => {
                console.log(`Server is listening on port ${PORT}`);
            });
        });
    });

    ipc.server.start();
}

try {
    main();
} catch (err) {
    logger.error("BOUNDARY ERROR", err);
}
