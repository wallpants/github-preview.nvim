import { type Socket } from "node:net";
import { parse } from "valibot";
import { ENV } from "../../../env";
import { browserState, updateCurrentPath } from "../browser-state";
import { type IPC_EVENTS } from "../consts";
import { logger } from "../logger";
import {
    ContentChangeSchema,
    type ContentChange,
    type WsSend,
    type WsServerMessage,
} from "../types";

const EVENT: (typeof IPC_EVENTS)[number] = "github-preview-content-change";

export function onEditorContentChange(wsSend: WsSend) {
    return async (contentChange: ContentChange, _socket: Socket) => {
        try {
            ENV.GP_IS_DEV && parse(ContentChangeSchema, contentChange);
            logger.verbose(EVENT, { contentChange });

            browserState.content = contentChange.content;

            let message: WsServerMessage = {};
            if (browserState.currentPath !== contentChange.abs_path)
                message = await updateCurrentPath(contentChange.abs_path);

            message.content = contentChange.content;

            wsSend(message);
        } catch (err) {
            logger.error("contentChangeEventHandler ERROR", err);
        }
    };
}
