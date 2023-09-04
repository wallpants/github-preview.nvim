import { type Socket } from "node:net";
import { parse } from "valibot";
import { ENV } from "../../../env";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import { CursorMoveSchema, type CursorMove } from "../types";
import { getEntries, makeCurrentEntry } from "../utils";
import { type HandlerArgs } from "./on-content-change";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";

export function registerOnCursorMove({ config, ipc, browserState, wsSend }: HandlerArgs) {
    ipc.server.on(EVENT, async (cursorMove: CursorMove, _socket: Socket) => {
        try {
            ENV.GP_IS_DEV && parse(CursorMoveSchema, cursorMove);
            logger.verbose(EVENT, { cursorMove });

            if (!cursorMove.abs_file_path) return;

            const currentEntry =
                cursorMove.abs_file_path !== browserState.currentEntry
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
    });
}
