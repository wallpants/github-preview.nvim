import { type BrowserState } from "@gp/shared";
import { globby } from "globby";
import { isText } from "istextorbinary";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

export function getRepoName({ root }: { root: BrowserState["root"] }): string {
    const gitConfig = readFileSync(resolve(root, ".git/config")).toString();
    const lines = gitConfig.split("\n");
    let repoName = "no-repo-name";

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line === '[remote "origin"]') {
            // nextLine = git@github.com:gualcasas/github-preview.nvim.git
            const nextLine = lines[i + 1];
            const repo = nextLine?.split(":")[1]?.slice(0, -4);
            if (repo) repoName = repo;
        }
    }
    return repoName;
}

export async function getEntries({
    currentPath,
    root,
}: {
    currentPath: BrowserState["currentPath"];
    root: BrowserState["root"];
}): Promise<string[]> {
    const relativePath = currentPath.slice(root.length);
    const currentDir = relativePath.endsWith("/") ? relativePath : dirname(relativePath) + "/";
    const paths = await globby(currentDir + "*", {
        cwd: root,
        dot: true,
        absolute: true,
        gitignore: true,
        onlyFiles: false,
        markDirectories: true,
    });

    const dirs: string[] = [];
    const files: string[] = [];

    for (const path of paths) {
        if (path.endsWith("/")) {
            if (!path.endsWith(".git/")) dirs.push(path);
        } else files.push(path);
    }

    dirs.sort();
    files.sort();

    return dirs.concat(files);
}

export function getContent({
    currentPath,
    entries,
}: {
    currentPath: BrowserState["currentPath"];
    entries: BrowserState["entries"];
}): { content: BrowserState["content"]; currentPath: string } {
    if (!existsSync(currentPath)) return { content: null, currentPath };

    const isDir = currentPath.endsWith("/");
    if (isDir) {
        // search for readme.md
        const readmePath = entries.find((e) => basename(e).toLowerCase() === "readme.md");
        if (readmePath) currentPath = readmePath;
        else return { content: null, currentPath };
    }

    if (isText(currentPath)) {
        return { content: readFileSync(currentPath).toString(), currentPath };
    }

    return { content: null, currentPath };

    // const isImage = checkIsImage(browserState.currentPath)
    // if (isImage) {
    //     return {
    //         content: null,
    //         image: {
    //             buffer: img,
    //             ext: isImage.ext,
    //             mime: isImage.mime,
    //         },
    //     };
    // }
}
