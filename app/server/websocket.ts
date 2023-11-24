import { type WebSocketHandler } from "bun";
import { type GithubPreview } from "../github-preview.ts";
import { type WsBrowserMessage, type WsServerMessage } from "../types.ts";

export const EDITOR_EVENTS_TOPIC = "editor_events";

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

            let hash: string | undefined;

            if ("path" in browserMessage) {
                // remove hash from browserMessage.path to prevent filesystem
                // operations from failing
                const [path, messageHash] = browserMessage.path.split("#");
                browserMessage.path = path!;
                hash = messageHash;
            }

            if (browserMessage.type === "init") {
                // call "setCurrPath" in case app started in repository mode and no buffer
                // was loaded. "setCurrPath" should resolve to readme.md if it exists.
                const entries = await app.setCurrPath(app.currentPath);

                const message: WsServerMessage = {
                    type: "init",
                    currentPath: app.currentPath,
                    repoName: app.repoName,
                    lines: app.lines,
                    config: app.config,
                    cursorLine: app.cursorLine,
                    currentEntries: entries,
                };
                wsSend(message);
            }

            if (browserMessage.type === "get_entries") {
                const message: WsServerMessage = {
                    type: "entries",
                    path: browserMessage.path,
                    entries: await app.getEntries(browserMessage.path),
                };
                wsSend(message);
            }

            if (browserMessage.type === "get_entry") {
                // if single-file mode is enabled, dont respond if browser requests
                // an entry other than the currentPath
                if (app.config.overrides.single_file && browserMessage.path !== app.currentPath) {
                    return;
                }

                const isDir = browserMessage.path.endsWith("/");

                // is same path, keep cursorLine
                const cursorLine =
                    browserMessage.path === app.currentPath && !isDir ? app.cursorLine : null;

                // list of entries if path is dir, otherwise undefined
                const entries = await app.setCurrPath(browserMessage.path);

                const message: WsServerMessage = {
                    type: "entry",
                    currentPath: app.currentPath,
                    lines: app.lines,
                    cursorLine: cursorLine,
                    hash: hash,
                    currentEntries: entries,
                };

                wsSend(message);
            }

            if (browserMessage.type === "update_config") {
                await app.updateConfig(browserMessage.action);
                const message: WsServerMessage = {
                    type: "update_config",
                    config: app.config,
                };
                wsSend(message);
            }
        },
    };
}
