import { type Server } from "bun";
import { attach, type LogLevel, type Nvim } from "bunvim";
import { globby } from "globby";
import { isBinaryFile } from "isbinaryfile";
import { existsSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { parse } from "valibot";
import { startServer } from "./server";
import { UNALIVE_URL } from "./server/http";
import { EDITOR_EVENTS_TOPIC } from "./server/websocket";
import {
    PluginPropsSchema,
    type Config,
    type ContentChange,
    type CustomEvents,
    type PluginProps,
    type WsServerMessage,
} from "./types";

const ENV = {
    NVIM: process.env["NVIM"],
    LOG_LEVEL: process.env["LOG_LEVEL"] as LogLevel | undefined,
    DEV: Boolean(process.env["IS_DEV"]),
};

export class GithubPreview {
    nvim: Nvim<CustomEvents>;
    lines: ContentChange["lines"];
    /**
     * Neovim autocommand group id,
     * under which all autocommands are to be registered
     */
    augroupId: number;
    /**
     * repo root absolute path
     */
    root: string;
    /**
     * currentPath: relative to root
     */
    currentPath: string;
    config: {
        dotfiles: Config;
        overrides: Config;
    };
    repoName: string;
    server: Server;
    cursorLine: null | number;

    private constructor(
        nvim: Nvim,
        augroupId: number,
        repoName: string,
        cursorLine: number,
        props: PluginProps,
    ) {
        this.nvim = nvim as Nvim<CustomEvents>;
        this.augroupId = augroupId;
        this.repoName = repoName;
        this.cursorLine = cursorLine;
        this.config = { dotfiles: props.config, overrides: props.config };
        this.currentPath = props.init.path.slice(props.init.root.length);
        this.lines = props.init.lines;
        this.root = props.init.root;

        // must be called at end of constructor,
        // because it requires the values set above
        this.server = startServer(this);
    }

    static async start() {
        // we use a static method to initialize GithubPreview instead
        // of using the constructor, because async constructors are not a thing
        if (!ENV.NVIM) throw Error("socket missing");

        const nvim = await attach<CustomEvents>({
            socket: ENV.NVIM,
            client: { name: "github-preview" },
            logging: { level: ENV.LOG_LEVEL },
        });

        const props = (await nvim.call("nvim_get_var", ["github_preview_props"])) as PluginProps;
        if (ENV.DEV) parse(PluginPropsSchema, props);

        try {
            // try to unalive already running instances of github-preview
            await fetch(`http://${props.config.host}:${props.config.port}${UNALIVE_URL}`);
            // eslint-disable-next-line
        } catch (err) {}

        const repoName = await GithubPreview.getRepoName({ root: props.init.root });
        const cursorLine = (await nvim.call("nvim_win_get_cursor", [0]))[0];
        const augroupId = await nvim.call("nvim_create_augroup", [
            "github-preview",
            { clear: true },
        ]);

        return new GithubPreview(nvim, augroupId, repoName, cursorLine, props);
    }

    static async getRepoName({ root }: { root: string }): Promise<string> {
        let repoName = "root";
        const gitConfig = Bun.file(resolve(root, ".git/config"));

        if (!(await gitConfig.exists())) {
            return repoName;
        }

        const lines = (await gitConfig.text()).split("\n");

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

    async getEntries(path: string): Promise<string[]> {
        if (this.config.overrides.single_file) return [];
        const currentDir = path.endsWith("/") ? path : dirname(path) + "/";
        const paths = await globby(currentDir + "*", {
            cwd: this.root,
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

    async readCurrPath(entries: string[]) {
        // TODO: check open buffers and get lines from there before falling
        // back to filesystem
        if (!existsSync(this.root + this.currentPath)) {
            this.lines = [`Path: ${this.currentPath}`, "", "ERROR: path not found"];
            return;
        }

        const isDir = (this.root + this.currentPath).endsWith("/");
        if (isDir) {
            // search for readme.md
            const readmePath = entries.find((e) => basename(e).toLowerCase() === "readme.md");
            if (readmePath) this.currentPath = readmePath;
            else {
                this.lines = [
                    `Directory: ${this.currentPath}`,
                    "",
                    "",
                    "Entries:",
                    ...entries.map((entry) => `- ${entry.slice(this.currentPath.length)}`),
                ];
                return;
            }
        }

        if (await isBinaryFile(this.root + this.currentPath)) {
            this.lines = [`File: ${this.currentPath}`, "", "ERROR: binary files not yet supported"];
            return;
        }

        const file = Bun.file(this.root + this.currentPath);
        // limit file size or browser freezes when trying to apply syntax highlight
        if (file.size > 500_000) {
            this.lines = [`File: ${this.currentPath}`, "", "ERROR: file too large (>500kB)"];
            return;
        }

        const fileContent = await file.text();
        this.lines = fileContent.split("\n");
    }

    wsSend(m: WsServerMessage) {
        this.nvim.logger?.verbose({ OUTGOING_WEBSOCKET: m });
        this.server.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(m));
    }
}
