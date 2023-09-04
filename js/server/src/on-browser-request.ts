import { type RawData } from "ws";
import { logger } from "./logger";
import { type BrowserState, type WsBrowserRequest, type WsServerMessage } from "./types";

type Args = {
    browserState: BrowserState;
    wsSend: (w: WsServerMessage) => void;
};

export function onBrowserRequest({ browserState, wsSend }: Args) {
    return (event: RawData) => {
        try {
            const browserRequest = JSON.parse(String(event)) as WsBrowserRequest;
            logger.verbose("onBrowserMessage", { browserRequest });

            if (browserRequest.type === "init") {
                wsSend(browserState);
                return;
            }
        } catch (err) {
            logger.error("onBrowserMessage ERROR", err);
        }
    };
}
