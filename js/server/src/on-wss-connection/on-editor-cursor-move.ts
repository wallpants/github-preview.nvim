import { parse } from "valibot";
import { ENV } from "../../../env";
import { browserState, updateCurrentPath } from "../browser-state";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import { CursorMoveSchema, type CursorMove, type WsSend, type WsServerMessage } from "../types";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";

export function onEditorCursorMove(wsSend: WsSend) {
    return async (cursorMove: CursorMove) => {
        try {
            ENV.GP_IS_DEV && parse(CursorMoveSchema, cursorMove);
            logger.verbose(EVENT, { cursorMove });

            let message: WsServerMessage = {};
            if (browserState.currentPath !== cursorMove.abs_path)
                message = await updateCurrentPath(cursorMove.abs_path);

            message.cursorMove = cursorMove;

            wsSend(message);
        } catch (err) {
            logger.error("cursorMoveEventHandler ERROR", err);
        }
    };
}
