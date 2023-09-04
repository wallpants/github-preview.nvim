import { isBinary } from "istextorbinary";
import { type RawData } from "ws";
import { logger } from "./logger";
import { type BrowserState, type WsBrowserMessage, type WsServerMessage } from "./types";
import { getEntries, makeCurrentEntry } from "./utils";

type Args = {
    root: string;
    browserState: BrowserState;
    wsSend: (w: WsServerMessage) => void;
};

export function onBrowserMessage({ root, browserState, wsSend }: Args) {
    return async (event: RawData) => {
        try {
            const browserMessage = JSON.parse(String(event)) as WsBrowserMessage;
            logger.verbose("onBrowserMessage", { browserMessage });
            const { currentBrowserPath } = browserMessage;

            if (isBinary(currentBrowserPath)) return;
            const response: WsServerMessage = {
                root,
                entries: await getEntries({ browserState, root, absPath: currentBrowserPath }),
                currentEntry: makeCurrentEntry({ absPath: currentBrowserPath }),
            };

            wsSend(response);
        } catch (err) {
            logger.error("onBrowserMessage ERROR", err);
        }
    };
}
