// cspell:ignore readdirSync
import { globby } from "globby";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { safeParse, type ObjectSchema } from "valibot";
import type winston from "winston";
import { ENV } from "../../env";
import { type Entry } from "./types";

/** Takes a string and wraps it inside a markdown
 * codeblock using file extension as language
 *
 * @example
 * ```
 * textToMarkdown({text, fileExt: "ts"});
 * ```
 */
export function textToMarkdown({
    text,
    fileExt,
}: {
    /** some def */
    text: string;
    fileExt: string;
}) {
    return fileExt === ".md" ? text : "```" + fileExt + `\n${text}`;
}

const MAX_ATTEMPTS = 30;
let attempt = 0;
export function findRepoRoot(cwd: string): string | null {
    do {
        attempt += 1;
        try {
            const paths = readdirSync(cwd);
            for (const path of paths) {
                const absolute = `${cwd}/${path}`;
                const pathStats = statSync(absolute);
                if (pathStats.isDirectory() && path === ".git") {
                    return cwd + "/";
                }
            }
            cwd = dirname(cwd);
        } catch (e) {
            // TODO: throw error, implement better logging
            console.log("error: ", e);
            return null;
        }
    } while (![".", "/"].includes(cwd) && attempt < MAX_ATTEMPTS);
    return null;
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

    const relativePath = relative(root, resolved);
    const dirEntries: Entry[] = dirs.map((d) => ({
        relativeToRoot: relativePath ? `${relativePath}/${d}` : d,
        type: "dir",
    }));
    const fileEntries: Entry[] = files.map((f) => ({
        relativeToRoot: relativePath ? `${relativePath}/${f}` : f,
        type: "file",
    }));

    return dirEntries.concat(fileEntries);
}

// eslint-disable-next-line
export function devSafeParse(logger: typeof winston, schema: ObjectSchema<any>, data: unknown) {
    // we validate payloads only in dev to avoid affecting performance in prod
    if (!ENV.IS_DEV) return;
    const parsed = safeParse(schema, data);
    if (!parsed.success) logger.error("PARSE ERROR", parsed);
}
