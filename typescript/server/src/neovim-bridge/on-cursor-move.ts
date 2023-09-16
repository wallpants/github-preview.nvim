import { CursorMoveSchema, ENV, type BrowserState, type CursorMove } from "@gp/shared";
import { type Server } from "bun";
import { parse } from "valibot";
import { updateBrowserState } from "../utils.ts";
import { EDITOR_EVENTS_TOPIC } from "../web-server/index.ts";

export async function onCursorMove(
    browserState: BrowserState,
    webServer: Server,
    cursorMove: CursorMove,
) {
    ENV.IS_DEV && parse(CursorMoveSchema, cursorMove);
    const message = await updateBrowserState(
        browserState,
        cursorMove.abs_path,
        cursorMove.cursor_line,
    );
    webServer.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}
