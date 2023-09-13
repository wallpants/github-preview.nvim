import { CursorMoveSchema, ENV, type CursorMove, type WsServerMessage } from "@gp/shared";
import { type Socket } from "bun";
import { parse } from "valibot";
import { getContent, getEntries } from "../utils.ts";
import { EDITOR_EVENTS_TOPIC } from "../web-server/index.ts";
import { type UnixSocketMetadata } from "./types.ts";

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
        browserState.entries = await getEntries({
            root: browserState.root,
            currentPath: cursorMove.abs_path,
        });
        const { content, currentPath } = getContent({
            entries: browserState.entries,
            currentPath: cursorMove.abs_path,
        });
        browserState.currentPath = currentPath;
        browserState.content = content;

        message.entries = browserState.entries;
        message.content = browserState.content;
    }

    unixSocket.data?.webServer?.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}
