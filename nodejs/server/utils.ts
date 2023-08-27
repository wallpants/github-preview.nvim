import { globby } from "globby";
import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
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

export function findRepoRoot(filePath: string): string | null {
    let dir = dirname(filePath);
    do {
        try {
            const paths = readdirSync(dir);
            for (const path of paths) {
                const absolute = `${dir}/${path}`;
                const pathStats = statSync(absolute);
                if (pathStats.isDirectory() && path === ".git") {
                    return dir;
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

export function getRepoName(root: string) {
    const gitConfig = readFileSync(resolve(root, ".git/config")).toString();
    const lines = gitConfig.split("\n");

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line === '[remote "origin"]') {
            // nextLine = git@github.com:gualcasas/github-preview.nvim.git
            const nextLine = lines[i + 1] as string | undefined;
            return nextLine?.split(":")[1].slice(0, -4);
        }
    }
}

export async function getDirEntries(
    dir: string,
): Promise<WsMessage["entries"]> {
    const paths = await globby("*", {
        cwd: dir,
        onlyFiles: false,
        gitignore: true,
        objectMode: true,
        dot: true,
    });

    const dirs: string[] = [];
    const files: string[] = [];

    for (const path of paths) {
        if (path.dirent.isDirectory() && path.name !== ".git") {
            dirs.push(path.name);
        } else files.push(path.name);
    }

    dirs.sort();
    files.sort();

    const entries = dirs
        .map((dir) => ({ name: dir, type: "dir" }))
        .concat(
            files.map((file) => ({ name: file, type: "file" })),
        ) as WsMessage["entries"];

    return entries;
}
