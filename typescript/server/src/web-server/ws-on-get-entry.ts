import { type BrowserState } from "@gp/shared";
import { type ServerWebSocket } from "bun";
import { updateBrowserState } from "../utils.ts";

export async function onWsGetEntry(
    webSocket: ServerWebSocket<unknown>,
    browserState: BrowserState,
    requestedCurrentPath: string,
) {
    const message = await updateBrowserState(browserState, requestedCurrentPath, null);
    logger.verbose(`onBrowserRequest.getEntry RESPONSE`, message);
    webSocket.send(JSON.stringify(message));
}
