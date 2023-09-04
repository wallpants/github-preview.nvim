import type { RawData } from "ws";
import { browserState } from "../browser-state";
import { logger } from "../logger";
import { type WsBrowserRequest, type WsSend, type WsServerMessage } from "../types";

export function onBrowserRequest(wsSend: WsSend) {
    return (data: RawData) => {
        const browserRequest = JSON.parse(String(data)) as WsBrowserRequest;
        logger.verbose("onBrowserRequest", { browserRequest });

        const message: WsServerMessage = browserState;

        if (browserRequest.type === "init") {
            wsSend(message);
            return;
        }
    };
}
