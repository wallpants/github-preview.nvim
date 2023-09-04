import { parse } from "valibot";
import { ENV } from "../../../env";
import { browserState } from "../browser-state";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import { CursorMoveSchema, type CursorMove, type WsSend, type WsServerMessage } from "../types";
import { getContent, getEntries } from "../utils";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";

export function onEditorCursorMove(wsSend: WsSend) {
    return (cursorMove: CursorMove) => {
        (async () => {
            ENV.GP_IS_DEV && parse(CursorMoveSchema, cursorMove);
            logger.verbose(EVENT, { cursorMove });

            const message: WsServerMessage = {};

            if (browserState.currentPath !== cursorMove.abs_path) {
                browserState.currentPath = cursorMove.abs_path;
                browserState.entries = await getEntries();

                message.currentPath = browserState.currentPath;
                message.entries = browserState.entries;

                browserState.content = getContent();
            }

            message.cursorMove = cursorMove;

            wsSend(message);
        })().catch((e) => logger.error("onEditorCursorMove ERROR", e));
    };
}
