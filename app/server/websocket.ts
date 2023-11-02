import { type WebSocketHandler } from "bun";
import { type GithubPreview } from "../github-preview.ts";
import { type WsBrowserMessage, type WsServerMessage } from "../types.ts";

export const EDITOR_EVENTS_TOPIC = "editor-events";

export function websocketHandler(app: GithubPreview): WebSocketHandler {
    return {
        open(webSocket) {
            // subscribe to a topic so we can publish messages from outside
            // webServer.publish(EDITOR_EVENTS_TOPIC, payload);
            webSocket.subscribe(EDITOR_EVENTS_TOPIC);
        },
        async message(webSocket, message: string) {
            const browserMessage = JSON.parse(message) as WsBrowserMessage;
            app.nvim.logger?.verbose({ INCOMING_WEBSOCKET: browserMessage });

            function wsSend(m: WsServerMessage) {
                app.nvim.logger?.verbose({ OUTGOING_WEBSOCKET: m });
                webSocket.send(JSON.stringify(m));
            }

            if (browserMessage.type === "init") {
                const message: WsServerMessage = {
                    type: "init",
                    currentPath: app.currentPath,
                    repoName: app.repoName,
                    lines: app.lines,
                    config: app.config,
                    cursorLine: app.cursorLine,
                };
                wsSend(message);
            }

            if (browserMessage.type === "getEntries") {
                const message: WsServerMessage = {
                    type: "entries",
                    path: browserMessage.path,
                    entries: await app.getEntries(browserMessage.path),
                };
                wsSend(message);
            }

            if (browserMessage.type === "getEntry") {
                await app.setCurrPath(browserMessage.path);

                const message: WsServerMessage = {
                    type: "entry",
                    currentPath: app.currentPath,
                    lines: app.lines,
                    cursorLine: null,
                };

                wsSend(message);
            }
        },
    };
}
