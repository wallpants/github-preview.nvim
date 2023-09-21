import { ENV, type BrowserState, type WsBrowserRequest, type WsServerMessage } from "@gp/shared";
import { type Server } from "bun";
import { type Nvim } from "bunvim";
import opener from "opener";
import { type ApiInfo } from "../types.ts";
import { getContent, getEntries } from "../utils.ts";
import { onHttpRequest } from "./on-http-request.ts";

export const EDITOR_EVENTS_TOPIC = "editor-events";

export function startWebServer(
    port: number,
    browserState: BrowserState,
    nvim: Nvim<ApiInfo>,
): Server {
    const webServer = Bun.serve({
        port: port,
        fetch: onHttpRequest,
        websocket: {
            open(webSocket) {
                // subscribe to a topic so we can publish messages from outside
                // webServer.publish(EDITOR_EVENTS_TOPIC, payload);
                webSocket.subscribe(EDITOR_EVENTS_TOPIC);
            },
            async message(webSocket, message: string) {
                const browserRequest = JSON.parse(message) as WsBrowserRequest;
                nvim.logger?.verbose({ INCOMING_WEBSOCKET: browserRequest });

                if (browserRequest.type === "init") {
                    const message: WsServerMessage = browserState;
                    webSocket.send(JSON.stringify(message));
                    nvim.logger?.verbose({ OUTGOING_WEBSOCKET: message });
                }

                if (browserRequest.type === "getEntry") {
                    const entries = await getEntries({
                        currentPath: browserRequest.currentPath,
                        root: browserState.root,
                    });
                    const { content, currentPath } = await getContent({
                        currentPath: browserRequest.currentPath,
                        entries: entries,
                    });
                    const stateUpdate: Partial<BrowserState> = {
                        currentPath: currentPath,
                        entries: entries,
                        content: content,
                        scroll: {
                            cursorLine: null,
                            winLine: null,
                        },
                    };
                    Object.assign(browserState, stateUpdate);
                    webSocket.send(JSON.stringify(stateUpdate));
                    nvim.logger?.verbose({ OUTGOING_WEBSOCKET: stateUpdate });
                }
            },
        },
    });

    if (!ENV.IS_DEV) opener(`http://localhost:${port}`);
    return webServer;
}
