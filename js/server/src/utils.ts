// cspell:ignore readdirSync
import { globby } from "globby";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { type BrowserState, type CurrentEntry } from "./types";

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

export function getRepoName(root: string): string {
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

export async function getEntries(
    browserState: BrowserState,
    currentAbsPath: string,
): Promise<string[] | undefined> {
    if (browserState.currentEntry === currentAbsPath) return Promise.resolve(undefined);

    const currentDir = currentAbsPath.endsWith("/") ? currentAbsPath : dirname(currentAbsPath);
    const paths = await globby("*", {
        cwd: currentDir,
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

export function makeCurrentEntry({
    absPath,
    content,
}: {
    absPath: string;
    content?: string;
}): CurrentEntry | undefined {
    if (absPath.endsWith("/")) return;

    const text = content ?? (existsSync(absPath) ? readFileSync(absPath).toString() : "");
    const fileExt = extname(absPath);
    const markdown = textToMarkdown({ text, fileExt });
    return {
        content: { fileExt, markdown },
        absPath,
    };
}
