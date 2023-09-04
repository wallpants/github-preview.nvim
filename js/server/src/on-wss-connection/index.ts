import type ipc from "node-ipc";
import { type WebSocket } from "ws";
import { browserState } from "../browser-state";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import { type WsServerMessage } from "../types";
import { onBrowserRequest } from "./on-browser-request";
import { onEditorContentChange } from "./on-editor-content-change";
import { onEditorCursorMove } from "./on-editor-cursor-move";

type Args = {
    ipc: typeof ipc;
};

export function onWssConnection({ ipc }: Args) {
    return (ws: WebSocket) => {
        function wsSend(m: WsServerMessage) {
            ws.send(JSON.stringify(m));
        }

        logger.verbose("onWssConnection", { browserState });
        ws.on("message", onBrowserRequest(wsSend));

        const CURSOR_MOVE: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";
        ipc.server.on(CURSOR_MOVE, onEditorCursorMove(wsSend));

        const CONTENT_CHANGE: (typeof IPC_EVENTS)[number] = "github-preview-content-change";
        ipc.server.on(CONTENT_CHANGE, onEditorContentChange(wsSend));
    };
}
