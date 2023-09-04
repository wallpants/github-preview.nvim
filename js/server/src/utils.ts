// cspell:ignore readdirSync
import { globby } from "globby";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { type BrowserState } from "./types";

/** Takes a string and wraps it inside a markdown
 * codeblock using file extension as language
 *
 * @example
 * ```
 * textToMarkdown({text, fileExt: "ts"});
 * ```
 */
export function textToMarkdown({ text, fileExt }: { text: string; fileExt: string }) {
    return fileExt === ".md" ? text : "```" + fileExt + `\n${text}`;
}

export function getRepoName({ root }: BrowserState): string {
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

export async function getEntries(browserState: BrowserState): Promise<string[]> {
    const relativePath = browserState.currentEntry.absPath.slice(browserState.root.length);
    const currentDir = relativePath.endsWith("/") ? relativePath : dirname(relativePath) + "/";
    const paths = await globby(currentDir + "*", {
        cwd: browserState.root,
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

// export async function getCurrentEntries(
//     browserState: BrowserState,
// ): Promise<{ entries: string[]; currentEntry: CurrentEntry }> {
//     const entries = await getEntries(browserState);

//     const isDir = browserState.currentEntry.absPath.endsWith("/");

//     if (isDir) {
//         // search for readme.md
//         const readmePath = entries.find((e) => basename(e).toLowerCase() === "readme.md");
//         if (readmePath) browserState.currentEntry.absPath = readmePath;
//     }

//     const isTextFile =
//         existsSync(browserState.currentEntry.absPath) &&
//         !isBinary(browserState.currentEntry.absPath);
//     const text = isTextFile && readFileSync(browserState.currentEntry.absPath).toString();
//     const fileExt = extname(browserState.currentEntry.absPath);
//     const markdown = text && textToMarkdown({ text, fileExt });

//     const currentEntry: CurrentEntry = {
//         absPath: browserState.currentEntry.absPath,
//     };

//     if (markdown) {
//         currentEntry.content = {
//             markdown,
//             fileExt,
//         };
//     }

//     return {
//         entries,
//         currentEntry,
//     };
// }
