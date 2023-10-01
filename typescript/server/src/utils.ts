import { type BrowserState, type PluginInit } from "@gp/shared";
import { globby } from "globby";
import { isBinaryFile } from "isbinaryfile";
import { existsSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

export async function getRepoName({ root }: { root: BrowserState["root"] }): Promise<string> {
    const gitConfig = await Bun.file(resolve(root, ".git/config")).text();
    const lines = gitConfig.split("\n");
    let repoName = "root";

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line === '[remote "origin"]') {
            // nextLine = git@github.com:gualcasas/github-preview.nvim.git
            const nextLine = lines[i + 1];
            const repo = nextLine?.split(":")[1]?.slice(0, -4).split("/")[1];
            if (repo) repoName = repo;
        }
    }
    return repoName;
}

export async function initBrowserState(init: PluginInit): Promise<BrowserState> {
    const relativePath = init.path.slice(init.root.length);

    const repoName = await getRepoName({ root: init.root });

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
        repoName,
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
        // sort dirs first and then alphabetically
        if (a.endsWith("/") && !b.endsWith("/")) return -1;
        if (b.endsWith("/") && !a.endsWith("/")) return 1;
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    });
}

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
            content: [`Path: ${path}`, "", "ERROR: path not found"],
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
                content: [
                    `Directory: ${path}`,
                    "",
                    "",
                    "Entries:",
                    ...entries.map((entry) => `- ${entry.slice(path.length)}`),
                ],
                path,
            };
        }
    }

    if (await isBinaryFile(root + path)) {
        return {
            content: [`File: ${path}`, "", "ERROR: binary files not yet supported"],
            path,
        };
    }

    const file = Bun.file(root + path);
    // limit file size or browser freezes when trying to apply syntax highlight
    if (file.size > 500_000) {
        return {
            content: [`File: ${path}`, "", "ERROR: file too large (>500kB)"],
            path,
        };
    }

    const fileContent = await file.text();
    return {
        content: fileContent.split("\n"),
        path,
    };
}
