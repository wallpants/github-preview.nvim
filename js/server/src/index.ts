import ipc from "node-ipc";
import { createServer } from "node:http";
import { type Socket } from "node:net";
import opener from "opener";
import { parse } from "valibot";
import { WebSocketServer } from "ws";
import { ENV } from "../../env";
import { browserState } from "./browser-state";
import { IPC_SERVER_ID, type IPC_EVENTS } from "./consts";
import { logger } from "./logger";
import { onHttpRequest } from "./on-http-request";
import { onWssConnection } from "./on-wss-connection";
import { PluginInitSchema, type PluginInit } from "./types";
import { getEntries, getRepoName } from "./utils";

ipc.config.id = IPC_SERVER_ID;
ipc.config.retry = 1500;
ipc.config.logger = (log) => logger.debug(log);

ipc.serve(function () {
    const updateConfig: (typeof IPC_EVENTS)[number] = "github-preview-init";
    // updateConfig event is first thing sent by client when connection opens
    ipc.server.on(updateConfig, (init: PluginInit, _socket: Socket) => {
        (async () => {
            ENV.GP_IS_DEV && parse(PluginInitSchema, init);
            logger.verbose(updateConfig, { init });

            browserState.root = init.root;
            browserState.repoName = getRepoName();
            browserState.entries = await getEntries();
            browserState.currentPath = init.path;
            browserState.content = init.content;

            const httpServer = createServer();
            httpServer.on("request", onHttpRequest);

            const wsServer = new WebSocketServer({ server: httpServer });
            wsServer.on("connection", onWssConnection({ ipc }));

            const PORT = ENV.VITE_GP_PORT ?? init.port;

            httpServer.listen(PORT, () => {
                logger.verbose(`Server is listening on port ${PORT}`);
                !ENV.GP_IS_DEV && opener(`http://localhost:${PORT}`);
            });
        })().catch((e) => logger.error("onUpdateConfig ERROR", e));
    });
});

ipc.server.start();
