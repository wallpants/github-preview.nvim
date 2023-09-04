import { type Socket } from "node:net";
import { parse } from "valibot";
import { ENV } from "../../../env";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import {
    CursorMoveSchema,
    type BrowserState,
    type CursorMove,
    type WsServerMessage,
} from "../types";
import { getEntries } from "../utils";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";

type Args = {
    browserState: BrowserState;
    wsSend: (m: WsServerMessage) => void;
};

export function onEditorCursorMove({ browserState, wsSend }: Args) {
    return (cursorMove: CursorMove, _socket: Socket) => {
        try {
            ENV.GP_IS_DEV && parse(CursorMoveSchema, cursorMove);
            logger.verbose(EVENT, { cursorMove });

            if (!cursorMove.abs_file_path) return;

            const currentEntry =
                cursorMove.abs_file_path !== browserState.currentEntry.absPath
                    ? makeCurrentEntry({ absPath: cursorMove.abs_file_path })
                    : undefined;

            wsSend({
                root: config.root,
                cursorMove,
                currentEntry,
                entries: await getEntries({
                    browserState,
                    root: config.root,
                    absPath: cursorMove.abs_file_path,
                }),
            });
        } catch (err) {
            logger.error("cursorMoveEventHandler ERROR", err);
        }
    };
}
