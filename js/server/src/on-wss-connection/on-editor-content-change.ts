import { type Socket } from "node:net";
import { parse } from "valibot";
import { ENV } from "../../../env";
import { browserState } from "../browser-state";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import {
    ContentChangeSchema,
    type ContentChange,
    type WsSend,
    type WsServerMessage,
} from "../types";
import { getEntries } from "../utils";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-content-change";

export function onEditorContentChange(wsSend: WsSend) {
    return (contentChange: ContentChange, _socket: Socket) => {
        (async () => {
            ENV.VITE_GP_IS_DEV && parse(ContentChangeSchema, contentChange);
            logger.verbose(EVENT, { contentChange });

            const message: WsServerMessage = {
                currentPath: contentChange.abs_path,
                content: contentChange.content,
            };

            if (browserState.currentPath !== contentChange.abs_path) {
                browserState.currentPath = contentChange.abs_path;
                browserState.content = contentChange.content;
                browserState.entries = await getEntries();

                message.entries = browserState.entries;
            }

            wsSend(message);
        })().catch((e) => logger.error("onEditorContentChange ERROR", e));
    };
}
