import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { readdirSync, statSync } from "node:fs";
import { dirname } from "node:path";
import type WebSocket from "ws";
import { type CursorMove, type PluginProps, type WsMessage } from "../types";

export function wsSend(ws: WebSocket, message: WsMessage) {
    ws.send(JSON.stringify(message));
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
    const markdown = (await buffer.lines).join("\n");
    return {
        cursorLine,
        markdownLen: markdown.length,
        winHeight,
        winLine,
        sync_scroll_type: props.sync_scroll_type,
    };
}

function parseGitIgnore(filePath: string) {
    console.log("gitignore path: ", filePath);
}

export function findRepoRoot(filePath: string): string | null {
    let dir = dirname(filePath);
    do {
        try {
            const paths = readdirSync(dir);
            for (const path of paths) {
                const absolute = `${dir}/${path}`;
                const pathStats = statSync(absolute);
                if (pathStats.isFile() && path === ".gitignore") {
                    parseGitIgnore(absolute);
                }

                if (pathStats.isDirectory() && path === ".git") {
                    return dir + "/";
                }
            }
            dir = dirname(dir);
        } catch (e) {
            // TODO: throw error, implement better logging
            console.log("error: ", e);
            return null;
        }
    } while (dir !== "/");
    return null;
}
