import { type Server, type Socket } from "bun";
import { type PluginInit, type WsBrowserRequest, type WsServerMessage } from "gpshared";
import { logger } from "../logger";
import { type UnixSocketMetadata } from "../unix-socket/types";
import { getContent } from "../utils";
import { onHttpRequest } from "./on-http-request";
import { onWsGetEntry } from "./ws-on-get-entry";

export const EDITOR_EVENTS_TOPIC = "editor-events";

export function startWebServer(
    init: PluginInit,
    unixSocket: Socket<UnixSocketMetadata | undefined>,
): Server {
    const browserState = unixSocket.data?.browserState;
    if (!browserState) throw Error("browserState missing");

    logger.verbose("starting http server", { init });
    logger.verbose("browserState: ", { browserState });

    return Bun.serve({
        port: init.port,
        fetch: onHttpRequest,
        websocket: {
            open(webSocket) {
                webSocket.subscribe(EDITOR_EVENTS_TOPIC);
            },
            async message(webSocket, message: string) {
                const browserRequest = JSON.parse(message) as WsBrowserRequest;
                logger.verbose(`onBrowserRequest.${browserRequest.type} REQUEST`, {
                    browserRequest,
                });

                if (browserRequest.type === "init") {
                    browserState.content = getContent({
                        currentPath: browserState.currentPath,
                        entries: browserState.entries,
                    });
                    const message: WsServerMessage = browserState;
                    logger.verbose(`onBrowserRequest.${browserRequest.type} RESPONSE`, message);
                    webSocket.send(JSON.stringify(message));
                }

                if (browserRequest.type === "getEntry")
                    await onWsGetEntry(webSocket, browserState, browserRequest.currentPath);
            },
        },
    });
}
