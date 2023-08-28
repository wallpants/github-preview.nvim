import { globby } from "globby";
import { type NeovimClient } from "neovim";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { type CursorMove, type Entry, type PluginProps } from "../types";

export async function getCursorMove(
    nvim: NeovimClient,
    props: PluginProps,
    markdown: string,
): Promise<CursorMove | undefined> {
    if (props.disable_sync_scroll) return undefined;
    const currentWindow = await nvim.window;
    const winLine = Number(await nvim.call("winline"));
    const winHeight = await currentWindow.height;
    const [cursorLine] = await currentWindow.cursor;
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

// TODO This seems convoluted
export async function getDirEntries({
    root,
    relativeDir,
}: {
    root: string;
    relativeDir: string;
}): Promise<Entry[]> {
    const resolved = resolve(root, relativeDir);
    const paths = await globby("*", {
        cwd: resolved,
        onlyFiles: false,
        gitignore: true,
        objectMode: true,
        dot: true,
    });

    const dirs: string[] = [];
    const files: string[] = [];

    for (const path of paths) {
        if (path.dirent.isDirectory()) {
            if (path.name !== ".git") dirs.push(path.name);
        } else files.push(path.name);
    }

    dirs.sort();
    files.sort();

    const relati = relative(root, resolved);
    const dirEntries: Entry[] = dirs.map((d) => ({
        relativeToRoot: relati ? `${relati}/${d}` : d,
        type: "dir",
    }));
    const fileEntries: Entry[] = files.map((f) => ({
        relativeToRoot: relati ? `${relati}/${f}` : f,
        type: "file",
    }));

    return dirEntries.concat(fileEntries);
}
