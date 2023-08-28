import { debounce } from "lodash-es";
import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { createServer } from "node:http";
import { dirname, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import opener from "opener";
import handler from "serve-handler";
import { WebSocketServer } from "ws";
import { LOCAL_FILE_ROUTE } from "../consts";
import {
    type Entry,
    type NeovimNotificationArgs,
    type PluginProps,
    type WsClientMessage,
    type WsServerMessage,
} from "../types";
import { PORT } from "./env";
import { localFileHandler } from "./local-file-handler";
import {
    findRepoRoot,
    getCursorMove,
    getDirEntries,
    getRepoName,
} from "./utils";

const RPC_EVENTS = [
    "markdown-preview-text-changed",
    "markdown-preview-cursor-moved",
    "markdown-preview-buffer-delete",
] as const;

export async function startServer(nvim: NeovimClient, props: PluginProps) {
    await nvim.lua('print("starting MarkdownPreview server")');

    const root = findRepoRoot(props.filepath);
    if (!root) throw Error("root .git directory NOT FOUND");

    const repoName = getRepoName(root);

    const server = createServer((req, res) => {
        if (req.method === "POST") {
            res.writeHead(200).end();
            server.close();
        }

        if (req.url?.startsWith(LOCAL_FILE_ROUTE)) {
            return localFileHandler(req, res, props.filepath);
        }

        return handler(req, res, {
            public: fileURLToPath(dirname(import.meta.url)),
            rewrites: [{ source: "**", destination: "/index.html" }],
            headers: [
                {
                    source: "**/*",
                    headers: [{ key: "Cache-Control", value: "no-cache" }],
                },
            ],
        });
    });
    const wss = new WebSocketServer({ server });

    const buffers = (await nvim.buffers) as AsyncBuffer[];
    const buffer = buffers.find(
        async (b) => (await b).name === props.filepath,
    )!;

    const entries = await getDirEntries(
        root,
        relative(root, dirname(props.filepath)),
    );

    wss.on("connection", async (ws, _req) => {
        const wsSend = (m: WsServerMessage) => ws.send(JSON.stringify(m));
        const debouncedWsSend = debounce(wsSend, props.scroll_debounce_ms, {
            leading: false,
            trailing: true,
        });

        for (const event of RPC_EVENTS) await nvim.subscribe(event);
        const markdown = (await buffer.lines).join("\n");
        const cursorMove = await getCursorMove(nvim, buffer, props);
        const entry: Entry = {
            relativeToRoot: relative(root, props.filepath),
            type: "file",
        };

        wsSend({
            root,
            markdown,
            cursorMove,
            entry,
            entries,
            repoName,
        });

        ws.on("close", async () => {
            for (const event of RPC_EVENTS) await nvim.unsubscribe(event);
        });

        ws.on("message", async (event) => {
            const { entry } = JSON.parse(event.toString()) as WsClientMessage;
            if (entry) {
                const normalizedEntry = {
                    ...entry,
                    // if we're at dir "./src" and navigate to "..",
                    // the path becomes "./src/.."
                    //
                    // normalize converts "./src/.." to "./"
                    relativeToRoot: normalize(entry.relativeToRoot),
                };
                if (entry.type === "dir") {
                    const entries = await getDirEntries(
                        root,
                        entry.relativeToRoot,
                    );
                    wsSend({
                        root,
                        entries,
                        entry: normalizedEntry,
                    });
                }
            }
        });

        nvim.on(
            "notification",
            async (
                event: (typeof RPC_EVENTS)[number],
                [arg]: NeovimNotificationArgs,
            ) => {
                const entry: Entry = {
                    relativeToRoot: relative(root, arg.file),
                    type: "file",
                };

                if (event === "markdown-preview-text-changed") {
                    const markdown = (await buffer.lines).join("\n");
                    wsSend({ root, markdown, entry });
                }

                if (event === "markdown-preview-buffer-delete") {
                    wsSend({ root, goodbye: true, entry });
                    server.close();
                }

                if (event === "markdown-preview-cursor-moved") {
                    const cursorMove = await getCursorMove(nvim, buffer, props);
                    debouncedWsSend({ root, cursorMove, entry });
                }
            },
        );
    });

    // we check for PORT for dev env
    const port = PORT || props.port;
    // don't open browser in dev, webapp is hosted on other port
    if (!PORT) opener(`http://localhost:${port}`);
    server.listen(port);
}
