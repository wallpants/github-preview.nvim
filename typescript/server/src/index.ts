import {
    CursorMoveSchema,
    GP_UNIX_SOCKET_PATH,
    PluginInitSchema,
    type SocketEvent,
    type WsServerMessage,
} from "@gp/shared";
import { parse } from "valibot";
import { ENV } from "./env";
import { getContent, getEntries, getRepoName } from "./utils";
import { EDITOR_EVENTS_TOPIC, createWebServer, type UnixSocketMetadata } from "./web-server";

Bun.listen<UnixSocketMetadata | undefined>({
    unix: GP_UNIX_SOCKET_PATH,
    socket: {
        async data(unixSocket, rawEvent) {
            const event = JSON.parse(rawEvent.toString()) as SocketEvent;
            console.debug(event);

            if (event.type === "init") {
                const init = event.data;
                ENV.IS_DEV && parse(PluginInitSchema, init);

                const entries = await getEntries({
                    root: init.root,
                    currentPath: init.path,
                });

                unixSocket.data = {
                    webServer: createWebServer(init, unixSocket),
                    browserState: {
                        root: init.root,
                        repoName: getRepoName({ root: init.root }),
                        currentPath: init.path,
                        entries: entries,
                        content: getContent({ currentPath: init.root, entries }),
                        disableSyncScroll: init.disable_sync_scroll,
                    },
                };

                // const wsServer = new WebSocketServer({ server: httpServer });
                // wsServer.on("connection", onWssConnection({ ipc, init }));

                // const PORT = ENV.VITE_GP_IS_DEV ? ENV.VITE_GP_WS_PORT : init.port;

                // httpServer.listen(PORT, () => {
                //     logger.verbose(`Server is listening on port ${PORT}`);
                //     if (!ENV.VITE_GP_IS_DEV) opener(`http://localhost:${PORT}`);
                // });
            }

            if (!unixSocket.data) return;

            function wsSend(w: WsServerMessage) {
                unixSocket.data?.webServer.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(w));
            }

            if (event.type === "cursor-move") {
                const cursorMove = event.data;
                ENV.IS_DEV && parse(CursorMoveSchema, cursorMove);

                const message: WsServerMessage = {
                    currentPath: cursorMove.abs_path,
                };

                if (unixSocket.data.browserState.currentPath !== cursorMove.abs_path) {
                    unixSocket.data.browserState.currentPath = cursorMove.abs_path;
                    unixSocket.data.browserState.entries = await getEntries({
                        root: unixSocket.data.browserState.root,
                        currentPath: cursorMove.abs_path,
                    });
                    unixSocket.data.browserState.content = getContent({
                        entries: unixSocket.data.browserState.entries,
                        currentPath: cursorMove.abs_path,
                    });

                    message.entries = unixSocket.data.browserState.entries;
                    message.content = unixSocket.data.browserState.content;
                }

                message.cursorMove = cursorMove;
                wsSend(message);
            }
        },
        error(_socket, error) {
            console.log("server says: error");
            throw error;
        },
    },
});

// logger.verbose({ ipc_server_config: ipc.config });
// ipc.serve(function () {
//     const updateConfig: (typeof EVENTS)[number] = "github-preview-init";
//     // updateConfig event is first thing sent by client when connection opens
//     ipc.server.on("python-event", (data: { gualberto: "casas" }) => {
//         logger.verbose("python-event", { data });
//     });
//     ipc.server.on(updateConfig, (init: PluginInit, _socket: Socket) => {
//         ENV.VITE_GP_IS_DEV && parse(PluginInitSchema, init);
//         logger.verbose(updateConfig, { init });

//         const httpServer = createServer();
//         httpServer.on("request", onHttpRequest);

//         const wsServer = new WebSocketServer({ server: httpServer });
//         wsServer.on("connection", onWssConnection({ ipc, init }));

//         const PORT = ENV.VITE_GP_IS_DEV ? ENV.VITE_GP_WS_PORT : init.port;

//         httpServer.listen(PORT, () => {
//             logger.verbose(`Server is listening on port ${PORT}`);
//             if (!ENV.VITE_GP_IS_DEV) opener(`http://localhost:${PORT}`);
//         });
//     });
// });

// ipc.server.start();
