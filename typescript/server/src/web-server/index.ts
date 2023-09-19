import { type BrowserState, type WsBrowserRequest, type WsServerMessage } from "@gp/shared";
import { type Server } from "bun";
import { type Nvim } from "bunvim";
import { type ApiInfo } from "../types.ts";
import { onHttpRequest } from "./on-http-request.ts";
import { onWsGetEntry } from "./ws-on-get-entry.ts";

export const EDITOR_EVENTS_TOPIC = "editor-events";

export function startWebServer(
    port: number,
    browserState: BrowserState,
    nvim: Nvim<ApiInfo>,
): Server {
    return Bun.serve({
        port: port,
        fetch: onHttpRequest,
        websocket: {
            open(webSocket) {
                // subscribe to a topic so we can publish messages from outside
                webSocket.subscribe(EDITOR_EVENTS_TOPIC);
            },
            async message(webSocket, message: string) {
                const browserRequest = JSON.parse(message) as WsBrowserRequest;
                nvim.logger?.verbose(`onBrowserRequest.${browserRequest.type} REQUEST`, {
                    browserRequest,
                });

                if (browserRequest.type === "init") {
                    const message: WsServerMessage = browserState;
                    nvim.logger?.verbose(
                        `onBrowserRequest.${browserRequest.type} RESPONSE`,
                        message,
                    );
                    webSocket.send(JSON.stringify(message));
                }

                if (browserRequest.type === "getEntry") {
                    await onWsGetEntry(webSocket, browserState, browserRequest.currentPath);
                }
            },
        },
    });
}
