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

            if (event.type === "github-preview-init") {
                const init = event.data;
                ENV.IS_DEV && parse(PluginInitSchema, init);

                const entries = await getEntries({
                    root: init.root,
                    currentPath: init.path,
                });

                unixSocket.data = {
                    browserState: {
                        root: init.root,
                        repoName: getRepoName({ root: init.root }),
                        currentPath: init.path,
                        entries: entries,
                        content: getContent({ currentPath: init.root, entries }),
                        disableSyncScroll: init.disable_sync_scroll,
                    },
                };

                unixSocket.data.webServer = createWebServer(init, unixSocket);

                // const wsServer = new WebSocketServer({ server: httpServer });
                // wsServer.on("connection", onWssConnection({ ipc, init }));

                // const PORT = ENV.VITE_GP_IS_DEV ? ENV.VITE_GP_WS_PORT : init.port;

                // httpServer.listen(PORT, () => {
                //     logger.verbose(`Server is listening on port ${PORT}`);
                //     if (!ENV.VITE_GP_IS_DEV) opener(`http://localhost:${PORT}`);
                // });
            }

            const browserState = unixSocket.data?.browserState;
            if (!browserState) return;

            function wsSend(m: WsServerMessage) {
                unixSocket.data?.webServer?.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(m));
            }

            if (event.type === "github-preview-cursor-move") {
                const cursorMove = event.data;
                ENV.IS_DEV && parse(CursorMoveSchema, cursorMove);

                const message: WsServerMessage = {
                    currentPath: cursorMove.abs_path,
                };

                if (browserState.currentPath !== cursorMove.abs_path) {
                    browserState.currentPath = cursorMove.abs_path;
                    browserState.entries = await getEntries({
                        root: browserState.root,
                        currentPath: cursorMove.abs_path,
                    });
                    browserState.content = getContent({
                        entries: browserState.entries,
                        currentPath: cursorMove.abs_path,
                    });

                    message.entries = browserState.entries;
                    message.content = browserState.content;
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
