import type _ipc from "node-ipc";
import { type Socket } from "node:net";
import { parse } from "valibot";
import { ENV } from "../../../env";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import {
    ContentChangeSchema,
    type BrowserState,
    type ContentChange,
    type PluginConfig,
    type WsServerMessage,
} from "../types";
import { getEntries, makeCurrentEntry } from "../utils";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-content-change";

export interface HandlerArgs {
    config: PluginConfig;
    ipc: typeof _ipc;
    browserState: BrowserState;
    wsSend: (m: WsServerMessage) => void;
}

export function registerOnContentChange({ config, ipc, browserState, wsSend }: HandlerArgs) {
    ipc.server.on(EVENT, async (contentChange: ContentChange, _socket: Socket) => {
        try {
            ENV.GP_IS_DEV && parse(ContentChangeSchema, contentChange);
            logger.verbose(EVENT, contentChange);

            if (!contentChange.abs_file_path) return;

            const message: WsServerMessage = {
                root: config.root,
                entries: await getEntries(browserState, contentChange.abs_file_path),
                currentEntry: makeCurrentEntry({
                    absPath: contentChange.abs_file_path,
                    content: contentChange.content,
                }),
            };

            wsSend(message);
        } catch (err) {
            logger.error("contentChangeEventHandler ERROR", err);
        }
    });
}
