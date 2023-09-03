import type _ipc from "node-ipc";
import { type Socket } from "node:net";
import { parse } from "valibot";
import { ENV } from "../../../env";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import {
    CursorMoveSchema,
    type BrowserState,
    type CursorMove,
    type PluginConfig,
    type WsServerMessage,
} from "../types";
import { getEntries, makeCurrentEntry } from "../utils";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";

interface Args {
    config: PluginConfig;
    ipc: typeof _ipc;
    browserState: BrowserState;
    wsSend: (m: WsServerMessage) => void;
}

export function registerOnCursorMove({ config, ipc, browserState, wsSend }: Args) {
    ipc.server.on(EVENT, async (cursorMove: CursorMove, _socket: Socket) => {
        try {
            ENV.GP_IS_DEV && parse(CursorMoveSchema, cursorMove);
            logger.verbose(EVENT, cursorMove);

            if (!cursorMove.abs_file_path) return;

            const currentEntry =
                cursorMove.abs_file_path !== browserState.currentEntry
                    ? makeCurrentEntry({ absPath: cursorMove.abs_file_path })
                    : undefined;

            wsSend({
                root: config.root,
                cursorMove,
                currentEntry,
                entries: await getEntries(browserState, cursorMove.abs_file_path),
            });
        } catch (err) {
            logger.error("cursorMoveEventHandler ERROR", err);
        }
    });
}
