import type { RawData } from "ws";
import { browserState } from "../browser-state";
import { logger } from "../logger";
import { type WsBrowserRequest, type WsSend, type WsServerMessage } from "../types";
import { getContent, getEntries } from "../utils";

export function onBrowserRequest(wsSend: WsSend) {
    return (data: RawData) => {
        (async () => {
            const browserRequest = JSON.parse(String(data)) as WsBrowserRequest;
            logger.verbose("onBrowserRequest", { browserRequest });

            if (browserRequest.type === "init") {
                const message: WsServerMessage = browserState;
                wsSend(message);
            }

            if (browserRequest.type === "getEntry") {
                browserState.currentPath = browserRequest.currentPath;
                browserState.entries = await getEntries();
                browserState.content = getContent();
                const message: WsServerMessage = {
                    currentPath: browserState.currentPath,
                    entries: browserState.entries,
                    content: browserState.content,
                };
                wsSend(message);
            }
        })().catch((e) => logger.error("onBrowserRequest ERROR", e));
    };
}
