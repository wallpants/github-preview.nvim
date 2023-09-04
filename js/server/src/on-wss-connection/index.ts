import type ipc from "node-ipc";
import { type WebSocket } from "ws";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import { onBrowserRequest } from "../on-browser-request";
import { type BrowserState, type PluginInit, type WsServerMessage } from "../types";
import { getEntries } from "../utils";
import { onEditorContentChange } from "./on-editor-content-change";
import { onEditorCursorMove } from "./on-editor-cursor-move";

type Args = {
    init: PluginInit;
    ipc: typeof ipc;
};

const browserState: BrowserState = {
    root: "",
    entries: [],
    currentEntry: {
        absPath: "",
    },
};

export function onWssConnection({ init, ipc }: Args) {
    return async (ws: WebSocket) => {
        function wsSend(m: WsServerMessage) {
            ws.send(JSON.stringify(m));
        }

        try {
            browserState.root = init.root;
            browserState.entries = await getEntries(browserState);
            browserState.currentEntry = {
                absPath: init.path,
                content: init.content,
            };

            logger.info("onWssConnection", { browserState });
            ws.on("message", onBrowserRequest({ browserState, wsSend }));

            const CURSOR_MOVE: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";
            ipc.server.on(CURSOR_MOVE, onEditorCursorMove({ browserState, wsSend }));

            const CONTENT_CHANGE: (typeof IPC_EVENTS)[number] = "github-preview-content-change";
            ipc.server.on(CONTENT_CHANGE, onEditorContentChange({ browserState, wsSend }));
        } catch (err) {
            logger.error("onWssConnection ERROR", err);
        }
    };
}
