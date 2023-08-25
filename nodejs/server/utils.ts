import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import type WebSocket from "ws";
import {
    type CursorMove,
    type PluginProps,
    type ServerMessage,
} from "../types";

export function wsSend(ws: WebSocket, message: ServerMessage) {
    ws.send(JSON.stringify(message));
}

export async function getBufferContent(buffer: AsyncBuffer) {
    const bufferLines = await buffer.lines;
    return bufferLines.join("\n");
}

export async function getCursorMove(
    nvim: NeovimClient,
    buffer: AsyncBuffer,
    props: PluginProps,
): Promise<CursorMove | undefined> {
    if (props.disable_sync_scroll) return undefined;
    const currentWindow = await nvim.window;
    const winLine = Number(await nvim.call("winline"));
    const winHeight = await currentWindow.height;
    const [cursorLine] = await currentWindow.cursor;
    const markdown = await getBufferContent(buffer);
    return {
        cursorLine,
        markdownLen: markdown.length,
        winHeight,
        winLine,
        sync_scroll_type: props.sync_scroll_type,
    };
}
