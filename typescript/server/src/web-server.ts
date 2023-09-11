import {
    type BrowserState,
    type PluginInit,
    type WsBrowserRequest,
    type WsServerMessage,
} from "@gp/shared";
import { type Server, type Socket } from "bun";
import { resolve } from "node:path";
import { getContent, getEntries } from "./utils";

export type UnixSocketMetadata = {
    browserState: BrowserState;
    webServer: Server;
};

export const EDITOR_EVENTS_TOPIC = "editor-events";

export function createWebServer(
    init: PluginInit,
    unixSocket: Socket<UnixSocketMetadata | undefined>,
): Server {
    const browserState = unixSocket.data?.browserState;
    console.debug("starting http server", init);
    console.log("browserState: ", browserState);

    if (!browserState) throw Error("browserState missing");

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
            async message(webSocket, message: string) {
                const browserRequest = JSON.parse(message) as WsBrowserRequest;
                console.debug(`onBrowserRequest.${browserRequest.type} REQUEST`, {
                    browserRequest,
                });

                if (browserRequest.type === "init") {
                    browserState.content = getContent({
                        currentPath: browserState.currentPath,
                        entries: browserState.entries,
                    });
                    const message: WsServerMessage = browserState;
                    console.debug(`onBrowserRequest.${browserRequest.type} RESPONSE`, message);
                    webSocket.send(JSON.stringify(message));
                }

                if (browserRequest.type === "getEntry") {
                    if (
                        browserState.currentPath === browserRequest.currentPath ||
                        // don't send files outside of root
                        browserRequest.currentPath.length < browserState.root.length
                    ) {
                        return;
                    }

                    browserState.currentPath = browserRequest.currentPath;
                    browserState.entries = await getEntries({
                        currentPath: browserRequest.currentPath,
                        root: browserState.root,
                    });
                    browserState.content = getContent({
                        currentPath: browserRequest.currentPath,
                        entries: browserState.entries,
                    });

                    const message: WsServerMessage = {
                        currentPath: browserState.currentPath,
                        entries: browserState.entries,
                        content: browserState.content,
                    };
                    console.debug(`onBrowserRequest.${browserRequest.type} RESPONSE`, message);
                    webSocket.send(JSON.stringify(message));
                }
            },
        },
    });
}
