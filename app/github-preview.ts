import { type Server } from "bun";
import { NVIM_LOG_LEVELS, attach, type LogLevel, type Nvim } from "bunvim";
import { globby } from "globby";
import { isBinaryFile } from "isbinaryfile";
import { existsSync } from "node:fs";
import { basename, dirname, normalize, resolve } from "node:path";
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
    type UpdateConfigAction,
    type WsServerMessage,
} from "./types";

const ENV = {
    NVIM: process.env["NVIM"],
    LOG_LEVEL: process.env["LOG_LEVEL"] as LogLevel | undefined,
    DEV: Boolean(process.env["IS_DEV"]),
};

export class GithubPreview {
    nvim: Nvim<CustomEvents>;
    /**
     * Neovim autocommand group id,
     * under which all autocommands are to be registered
     */
    augroupId: number;
    /**
     * repo root absolute path.
     *
     * Includes trailing slash
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
    cursorLine: null | number = null;
    lines: ContentChange["lines"] = [];

    private constructor(nvim: Nvim, augroupId: number, repoName: string, props: PluginProps) {
        this.nvim = nvim as Nvim<CustomEvents>;
        this.augroupId = augroupId;
        this.repoName = repoName;
        this.config = {
            dotfiles: Object.assign({}, props.config),
            overrides: Object.assign({}, props.config),
        };
        this.currentPath = props.init.path.slice(props.init.root.length);
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
        const augroupId = await nvim.call("nvim_create_augroup", [
            "github-preview",
            { clear: true },
        ]);

        return new GithubPreview(nvim, augroupId, repoName, props);
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

    /**
     * Updates this.currentPath & this.lines based on "path" provided.
     * returns entries if path is a dir
     */
    async setCurrPath(path: string): Promise<undefined | string[]> {
        // do not return any entries outside of repo root
        const normalized = normalize(this.root + path);
        if (normalized.length < this.root.length) return;

        this.currentPath = path;

        // check open buffers and get lines from there before falling back to filesystem.
        const bufs = await this.nvim.call("nvim_list_bufs", []);
        for (const buf of bufs) {
            const name = await this.nvim.call("nvim_buf_get_name", [buf]);
            if (name === this.root + this.currentPath) {
                this.lines = await this.nvim.call("nvim_buf_get_lines", [buf, 0, -1, true]);
                return;
            }
        }

        if (!existsSync(this.root + this.currentPath)) {
            this.lines = [`Path: ${this.currentPath}`, "", "ERROR: path not found"];
            return;
        }

        const isDir = (this.root + this.currentPath).endsWith("/");
        if (isDir) {
            const entries = await this.getEntries(this.currentPath);
            // search for readme.md
            const readmePath = entries.find((e) => basename(e).toLowerCase() === "readme.md");
            if (readmePath) this.currentPath = readmePath;
            else {
                this.lines = [];
                return entries;
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
        return;
    }

    wsSend(m: WsServerMessage) {
        this.nvim.logger?.verbose({ OUTGOING_WEBSOCKET: m });
        this.server.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(m));
    }

    async goodbye() {
        this.wsSend({ type: "goodbye" });
        await this.nvim.call("nvim_del_augroup_by_id", [this.augroupId]);
        await this.nvim.call("nvim_notify", ["github-preview: goodbye", NVIM_LOG_LEVELS.INFO, {}]);
    }

    async updateConfig([action, value]: UpdateConfigAction) {
        let update: Partial<Config> = {};

        const updateSingleFile = async (dotfileValue: boolean, newValue: boolean) => {
            // we need a function to validate single-file mode config updates
            // because single-file mode cannot be disabled if plugin launched
            // in single-file mode
            if (dotfileValue && !newValue) {
                await this.nvim.call("nvim_notify", [
                    "github-preview: if plugin launched in single-file mode, it cannot be changed.",
                    NVIM_LOG_LEVELS.WARN,
                    {},
                ]);
            } else {
                update.single_file = newValue;
            }
        };

        const { overrides, dotfiles } = this.config;

        switch (action) {
            case "theme_name":
                update.theme = {
                    ...overrides.theme,
                    name: value,
                };
                break;
            case "theme_high_contrast":
                update.theme = {
                    ...overrides.theme,
                    high_contrast: value === "on",
                };
                break;
            case "clear_overrides":
                update = dotfiles;
                break;
            case "single_file": {
                if (value === "toggle") {
                    await updateSingleFile(dotfiles.single_file, !overrides.single_file);
                } else {
                    await updateSingleFile(dotfiles.single_file, value === "on" ? true : false);
                }
                break;
            }
            case "details_tags":
                if (value === "toggle") {
                    update.details_tags_open = !overrides.details_tags_open;
                } else {
                    update.details_tags_open = value === "open" ? true : false;
                }
                break;
            case "scroll":
                if (value === "toggle") {
                    update.scroll = { ...overrides.scroll, disable: !overrides.scroll.disable };
                } else {
                    update.scroll = { ...overrides.scroll, disable: value === "on" ? false : true };
                }
                break;
            case "scroll.offset":
                update.scroll = { ...overrides.scroll, top_offset_pct: value };
                break;
            case "cursorline":
                if (value === "toggle") {
                    update.cursor_line = {
                        ...overrides.cursor_line,
                        disable: !overrides.cursor_line.disable,
                    };
                } else {
                    update.cursor_line = {
                        ...overrides.cursor_line,
                        disable: value === "on" ? false : true,
                    };
                }
                break;
            case "cursorline.color":
                update.cursor_line = {
                    ...overrides.cursor_line,
                    color: value,
                };
                break;
            case "cursorline.opacity":
                update.cursor_line = {
                    ...overrides.cursor_line,
                    opacity: value,
                };
                break;
        }

        Object.assign(overrides, update);
    }
}
