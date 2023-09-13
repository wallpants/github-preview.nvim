import { type BrowserState, type WsServerMessage } from "@gp/shared";
import { type ServerWebSocket } from "bun";
import { logger } from "../logger.ts";
import { getContent, getEntries } from "../utils.ts";

export async function onWsGetEntry(
    webSocket: ServerWebSocket<unknown>,
    browserState: BrowserState,
    requestedCurrentPath: string,
) {
    if (
        browserState.currentPath === requestedCurrentPath ||
        // don't send files outside of root
        requestedCurrentPath.length < browserState.root.length
    ) {
        return;
    }

    browserState.entries = await getEntries({
        currentPath: requestedCurrentPath,
        root: browserState.root,
    });
    const { content, currentPath } = getContent({
        currentPath: requestedCurrentPath,
        entries: browserState.entries,
    });
    browserState.currentPath = currentPath;
    browserState.content = content;

    const message: WsServerMessage = {
        currentPath: browserState.currentPath,
        entries: browserState.entries,
        content: browserState.content,
    };
    logger.verbose(`onBrowserRequest.getEntry RESPONSE`, message);
    webSocket.send(JSON.stringify(message));
}
