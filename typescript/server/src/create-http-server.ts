import { type BrowserState, type PluginInit } from "@gp/shared";
import { type Server, type Socket } from "bun";
import { resolve } from "node:path";

export type UnixSocketMetadata = {
    browserState: BrowserState;
    webServer: Server;
};

export const EDITOR_EVENTS_TOPIC = "editor-events";

export function createHttpServer(
    init: PluginInit,
    unixSocket: Socket<UnixSocketMetadata | undefined>,
): Server {
    console.debug("starting http server", init);
    return Bun.serve({
        port: init.port,
        fetch(req, server) {
            const upgradedToWs = server.upgrade(req, {
                data: {}, // this data is available in socket.data
                headers: {},
            });
            if (upgradedToWs) return;

            return new Response(Bun.file(resolve(import.meta.url, "../../web/dist/index.html")));
        },

        websocket: {
            open(webSocket) {
                webSocket.subscribe(EDITOR_EVENTS_TOPIC);
            },
            message(_webSocket, message) {
                console.log("browserState: ", unixSocket.data?.browserState);
                console.log("received browserRequest: ", message);
                // const browserRequest = JSON.parse(String(data)) as WsBrowserRequest;
                // logger.verbose(`onBrowserRequest.${browserRequest.type} REQUEST`, {
                //     browserRequest,
                // });

                // if (browserRequest.type === "init") {
                //     browserState.content = getContent({
                //         currentPath: browserState.currentPath,
                //         entries: browserState.entries,
                //     });
                //     const message: WsServerMessage = browserState;
                //     logger.verbose(`onBrowserRequest.${browserRequest.type} RESPONSE`, message);
                //     wsSend(message);
                // }

                // if (browserRequest.type === "getEntry") {
                //     if (
                //         browserState.currentPath === browserRequest.currentPath ||
                //         // don't send files outside of root
                //         browserRequest.currentPath.length < browserState.root.length
                //     ) {
                //         return;
                //     }

                //     browserState.currentPath = browserRequest.currentPath;
                //     browserState.entries = await getEntries({
                //         currentPath: browserRequest.currentPath,
                //         root: browserState.root,
                //     });
                //     browserState.content = getContent({
                //         currentPath: browserRequest.currentPath,
                //         entries: browserState.entries,
                //     });

                //     const message: WsServerMessage = {
                //         currentPath: browserState.currentPath,
                //         entries: browserState.entries,
                //         content: browserState.content,
                //     };
                //     logger.verbose(`onBrowserRequest.${browserRequest.type} RESPONSE`, message);
                //     wsSend(message);
            },
        },
    });
}
