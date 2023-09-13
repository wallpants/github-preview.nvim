import { type BrowserState, type WsServerMessage } from "@gp/shared";
import { type ServerWebSocket } from "bun";
import { logger } from "../logger.ts";
import { getContent, getEntries } from "../utils.ts";

export async function onWsGetEntry(
    webSocket: ServerWebSocket<unknown>,
    browserState: BrowserState,
    currentPath: string,
) {
    if (
        browserState.currentPath === currentPath ||
        // don't send files outside of root
        currentPath.length < browserState.root.length
    ) {
        return;
    }

    browserState.currentPath = currentPath;
    browserState.entries = await getEntries({
        currentPath: currentPath,
        root: browserState.root,
    });
    browserState.content = getContent({
        currentPath: currentPath,
        entries: browserState.entries,
    });

    const message: WsServerMessage = {
        currentPath: browserState.currentPath,
        entries: browserState.entries,
        content: browserState.content,
    };
    logger.verbose(`onBrowserRequest.getEntry RESPONSE`, message);
    webSocket.send(JSON.stringify(message));
}
