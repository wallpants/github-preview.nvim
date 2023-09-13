import { CursorMoveSchema, ENV, type CursorMove } from "@gp/shared";
import { type Socket } from "bun";
import { parse } from "valibot";
import { updateBrowserState } from "../utils.ts";
import { EDITOR_EVENTS_TOPIC } from "../web-server/index.ts";
import { type UnixSocketMetadata } from "./types.ts";

export async function onCursorMove(unixSocket: Socket<UnixSocketMetadata>, cursorMove: CursorMove) {
    ENV.IS_DEV && parse(CursorMoveSchema, cursorMove);
    const browserState = unixSocket.data?.browserState;
    if (!browserState) return;
    const message = await updateBrowserState(
        browserState,
        cursorMove.abs_path,
        cursorMove.cursor_line,
    );
    unixSocket.data?.webServer?.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}
