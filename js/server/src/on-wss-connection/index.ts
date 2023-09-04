import type ipc from "node-ipc";
import { basename } from "node:path";
import { type WebSocket } from "ws";
import { logger } from "../logger";
import { onBrowserMessage } from "../on-browser-message";
import { type BrowserState, type PluginConfig, type WsServerMessage } from "../types";
import { getEntries, getRepoName, makeCurrentEntry } from "../utils";
import { initMessage } from "./init-message";
import { registerOnContentChange } from "./on-content-change";
import { registerOnCursorMove } from "./on-cursor-move";

type Args = {
    config: PluginConfig;
    ipc: typeof ipc;
};

const browserState: BrowserState = {
    currentEntry: "",
};

export function onWssConnection({ config, ipc }: Args) {
    return async (ws: WebSocket) => {
        function wsSend(m: WsServerMessage) {
            ws.send(JSON.stringify(m));
        }

        try {
            const absPath = config.init_path;
            const initEntries = await getEntries({
                root: config.root,
                browserState,
                absPath,
            });
            let initCurrentEntry = makeCurrentEntry({ absPath });

            if (!initCurrentEntry.content) {
                // search for README.md in current dir
                const readmePath = initEntries?.find(
                    (e) => basename(e).toLowerCase() === "readme.md",
                );
                if (readmePath) initCurrentEntry = makeCurrentEntry({ absPath: readmePath });
            }

            const initialMessage: WsServerMessage = {
                root: config.root,
                repoName: getRepoName(config.root),
                entries: initEntries,
                currentEntry: initCurrentEntry,
            };

            wsSend(initialMessage);
            browserState.currentEntry = initialMessage.currentEntry?.absPath ?? "";

            const handlerArgs = { config, ipc, browserState, wsSend };
            void initMessage(handlerArgs);
            registerOnContentChange(handlerArgs);
            registerOnCursorMove(handlerArgs);

            ws.on("message", onBrowserMessage({ root: config.root, browserState, wsSend }));
        } catch (err) {
            logger.error("onWssConnection ERROR", err);
        }
    };
}
