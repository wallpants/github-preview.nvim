import { type BrowserState, type PluginInit } from "@gp/shared";
import { globby } from "globby";
import { isBinaryFile } from "isbinaryfile";
import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";

export async function initBrowserState(init: PluginInit): Promise<BrowserState> {
    const relativePath = init.path.slice(init.root.length);

    const entries = await getEntries({
        root: init.root,
        path: relativePath,
    });

    const { path, content } = await getContent({
        root: init.root,
        path: relativePath,
        entries,
    });

    return {
        root: init.root,
        content,
        currentPath: path,
        cursorLineColor: init.cursor_line.disable ? "transparent" : init.cursor_line.color,
        cursorLine: null,
        topOffsetPct: init.scroll.disable ? null : init.scroll.top_offset_pct,
    };
}

export async function getEntries({
    root,
    path,
}: {
    root: string;
    path: string;
}): Promise<string[]> {
    const currentDir = path.endsWith("/") ? path : dirname(path) + "/";
    const paths = await globby(currentDir + "*", {
        cwd: root,
        dot: true,
        ignore: [".git"],
        gitignore: true,
        onlyFiles: false,
        markDirectories: true,
    });

    return paths.sort((a, b) => {
        if (a.endsWith("/") && !b.endsWith("/")) return -1;
        if (b.endsWith("/") && !a.endsWith("/")) return 1;
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    });
}

const signature = [
    "Built with ♥️ by https://github.com/wallpants",
    "",
    "hire me, maybe? [jobs@wallpants.io]",
];

export async function getContent({
    root,
    path,
    entries,
}: {
    root: string;
    path: string;
    entries: string[];
}): Promise<{ content: string[]; path: string }> {
    if (!existsSync(root + path)) {
        return {
            content: [
                `Path: ${path}`,
                "",
                "ERROR: path not found",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                ...signature,
            ],
            path,
        };
    }

    const isDir = (root + path).endsWith("/");
    if (isDir) {
        // search for readme.md
        const readmePath = entries.find((e) => basename(e).toLowerCase() === "readme.md");
        if (readmePath) path = readmePath;
        else {
            return {
                content: signature,
                path,
            };
        }
    }

    if (await isBinaryFile(root + path)) {
        return {
            content: [
                `File: ${path}`,
                "",
                "ERROR: binary files not yet supported",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                ...signature,
            ],
            path,
        };
    }

    const file = Bun.file(root + path);
    // limit file size or browser freezes when trying to apply syntax highlight
    if (file.size > 500_000) {
        return {
            content: [
                `File: ${path}`,
                "",
                "ERROR: file too large (>500kB)",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                ...signature,
            ],
            path,
        };
    }

    const fileContent = await file.text();
    return {
        content: fileContent.split("\n"),
        path,
    };
}
