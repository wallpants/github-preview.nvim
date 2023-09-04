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
import { getCurrentEntry, getEntries } from "../utils";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";

type Args = {
    browserState: BrowserState;
    wsSend: (m: WsServerMessage) => void;
};

export function onEditorCursorMove({ browserState, wsSend }: Args) {
    return async (cursorMove: CursorMove, _socket: Socket) => {
        try {
            ENV.GP_IS_DEV && parse(CursorMoveSchema, cursorMove);
            logger.verbose(EVENT, { cursorMove });

            if (!cursorMove.abs_path) return;

            if (cursorMove.abs_path !== browserState.currentEntry.absPath) {
                browserState.entries = await getEntries(browserState);
                // we update currentEntry.absPath, because that's what we use
                // in `getCurrentEntry` to make the entry
                browserState.currentEntry.absPath = cursorMove.abs_path;
                browserState.currentEntry = getCurrentEntry(browserState);
            }

            const currentEntry =
                cursorMove.abs_path !== browserState.currentEntry.absPath
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
