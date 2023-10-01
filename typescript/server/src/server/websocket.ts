import { type BrowserState, type WsBrowserRequest, type WsServerMessage } from "@gp/shared";
import { type WebSocketHandler } from "bun";
import { type Nvim } from "bunvim";
import { getContent, getEntries } from "../utils.ts";

export const EDITOR_EVENTS_TOPIC = "editor-events";

export function websocketHandler(nvim: Nvim, browserState: BrowserState): WebSocketHandler {
    return {
        open(webSocket) {
            // subscribe to a topic so we can publish messages from outside
            // webServer.publish(EDITOR_EVENTS_TOPIC, payload);
            webSocket.subscribe(EDITOR_EVENTS_TOPIC);
        },
        async message(webSocket, message: string) {
            const browserRequest = JSON.parse(message) as WsBrowserRequest;
            nvim.logger?.verbose({ INCOMING_WEBSOCKET: browserRequest });

            function wsSend(m: WsServerMessage, type: string) {
                nvim.logger?.verbose({ OUTGOING_WEBSOCKET: m, type });
                webSocket.send(JSON.stringify(m));
            }

            if (browserRequest.type === "init") {
                wsSend(browserState, "init");
            }

            if (browserRequest.type === "getEntries") {
                wsSend(
                    {
                        entries: {
                            path: browserRequest.path,
                            list: await getEntries({
                                root: browserState.root,
                                path: browserRequest.path,
                            }),
                        },
                    },
                    "getEntries",
                );
            }

            if (browserRequest.type === "getEntry") {
                const entries = await getEntries({
                    root: browserState.root,
                    path: browserRequest.path,
                });
                const { content, path } = await getContent({
                    root: browserState.root,
                    path: browserRequest.path,
                    entries,
                });

                browserState.content = content;
                browserState.currentPath = path;

                wsSend(
                    {
                        currentPath: browserState.currentPath,
                        content,
                        cursorLine: null,
                    },
                    "getEntry",
                );
            }
        },
    };
}
