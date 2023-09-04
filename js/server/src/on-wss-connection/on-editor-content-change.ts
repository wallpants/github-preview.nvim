import { type Socket } from "node:net";
import { parse } from "valibot";
import { ENV } from "../../../env";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import {
    ContentChangeSchema,
    type BrowserState,
    type ContentChange,
    type WsServerMessage,
} from "../types";
import { getEntries } from "../utils";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-content-change";

export type HandlerArgs = {
    browserState: BrowserState;
    wsSend: (m: WsServerMessage) => void;
};

export function onEditorContentChange({ browserState, wsSend }: HandlerArgs) {
    return async (contentChange: ContentChange, _socket: Socket) => {
        try {
            ENV.GP_IS_DEV && parse(ContentChangeSchema, contentChange);
            logger.verbose(EVENT, { contentChange });

            if (!contentChange.abs_file_path) return;

            const message: WsServerMessage = {
                root: browserState.root,
                entries: await getEntries({
                    browserState,
                    root: browserState.root,
                    absPath: contentChange.abs_file_path,
                }),
                currentEntry: makeCurrentEntry({
                    content: contentChange.content,
                    absPath: contentChange.abs_file_path,
                }),
            };

            wsSend(message);
        } catch (err) {
            logger.error("contentChangeEventHandler ERROR", err);
        }
    };
}
