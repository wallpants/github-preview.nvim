import { type BrowserState, type PluginInit } from "@gp/shared";
import { globby } from "globby";
import { isText } from "istextorbinary";
import { existsSync } from "node:fs";
import { basename, dirname, relative } from "node:path";

export async function initBrowserState(init: PluginInit): Promise<BrowserState> {
    const entries = await getEntries({
        root: init.root,
        currentPath: init.path,
    });

    const { currentPath, content } = await getContent({
        currentPath: init.root,
        entries,
    });

    return {
        root: init.root,
        content,
        currentPath: relative(init.root, currentPath),
        cursorLineColor: init.cursor_line.disable ? "transparent" : init.cursor_line.color,
        cursorLine: null,
        topOffsetPct: init.scroll.disable ? null : init.scroll.top_offset_pct,
    };
}

export async function getEntries({
    root,
    currentPath,
}: {
    root: BrowserState["root"];
    currentPath: BrowserState["currentPath"];
}): Promise<string[]> {
    const currentDir = currentPath.endsWith("/") ? currentPath : dirname(currentPath) + "/";
    const paths = await globby(currentDir + "*", {
        cwd: root,
        dot: true,
        ignore: [".git"],
        absolute: true,
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

export async function getContent({
    currentPath,
    entries,
}: {
    currentPath: BrowserState["currentPath"];
    entries: string[];
}): Promise<{ content: BrowserState["content"]; currentPath: string }> {
    if (!existsSync(currentPath)) {
        return {
            content: [],
            currentPath,
        };
    }

    const isDir = currentPath.endsWith("/");
    if (isDir) {
        // search for readme.md
        const readmePath = entries.find((e) => basename(e).toLowerCase() === "readme.md");
        if (readmePath) currentPath = readmePath;
        else {
            return {
                content: [],
                currentPath,
            };
        }
    }

    if (isText(currentPath)) {
        const fileContent = await Bun.file(currentPath).text();
        return {
            // TODO(gualcasas): rewrite using Bun's apis
            content: fileContent.split("\n"),
            currentPath,
        };
    }

    return {
        content: [],
        currentPath,
    };
}
