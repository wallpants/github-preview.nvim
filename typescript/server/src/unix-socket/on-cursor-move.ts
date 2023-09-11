import { CursorMoveSchema, ENV, type CursorMove, type WsServerMessage } from "@gp/shared";
import { type Socket } from "bun";
import { parse } from "valibot";
import { logger } from "../logger";
import { getContent, getEntries } from "../utils";
import { EDITOR_EVENTS_TOPIC } from "../web-server";
import { type UnixSocketMetadata } from "./types";

export async function onCursorMove(unixSocket: Socket<UnixSocketMetadata>, cursorMove: CursorMove) {
    ENV.IS_DEV && parse(CursorMoveSchema, cursorMove);
    const browserState = unixSocket.data?.browserState;
    if (!browserState) return;

    const message: WsServerMessage = {
        currentPath: cursorMove.abs_path,
        cursorMoveLine: cursorMove.cursor_line,
    };

    const currentPathChanged = browserState.currentPath !== cursorMove.abs_path;

    if (currentPathChanged) {
        browserState.currentPath = cursorMove.abs_path;
        browserState.entries = await getEntries({
            root: browserState.root,
            currentPath: cursorMove.abs_path,
        });
        browserState.content = getContent({
            entries: browserState.entries,
            currentPath: cursorMove.abs_path,
        });

        message.entries = browserState.entries;
        message.content = browserState.content;
    }

    logger.verbose("content-change", { message });
    unixSocket.data?.webServer?.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}
