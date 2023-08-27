import { debounce } from "lodash-es";
import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { createServer } from "node:http";
import { dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import opener from "opener";
import handler from "serve-handler";
import { WebSocketServer, type WebSocket } from "ws";
import { LOCAL_FILE_ROUTE } from "../consts";
import {
    type NeovimNotificationArgs,
    type PluginProps,
    type WsMessage,
} from "../types";
import { PORT } from "./env";
import { localFileHandler } from "./local-file-handler";
import {
    findRepoRoot,
    getCursorMove,
    getDirEntries,
    getRepoName,
    wsSend,
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

    const debouncedWsSend = debounce(
        (ws: WebSocket, message: WsMessage) => wsSend(ws, message),
        props.scroll_debounce_ms,
        { leading: false, trailing: true },
    );

    const entries = await getDirEntries(dirname(props.filepath));

    wss.on("connection", async (ws, _req) => {
        for (const event of RPC_EVENTS) await nvim.subscribe(event);
        const markdown = (await buffer.lines).join("\n");
        const cursorMove = await getCursorMove(nvim, buffer, props);
        const relativeFilepath = relative(root, props.filepath);
        wsSend(ws, {
            markdown,
            cursorMove,
            relativeFilepath,
            entries,
            repoName,
        });

        ws.on("close", async () => {
            for (const event of RPC_EVENTS) await nvim.unsubscribe(event);
        });

        nvim.on(
            "notification",
            async (
                event: (typeof RPC_EVENTS)[number],
                [arg]: NeovimNotificationArgs,
            ) => {
                const relativeFilepath = relative(root, arg.file);

                if (event === "markdown-preview-text-changed") {
                    const markdown = (await buffer.lines).join("\n");
                    wsSend(ws, { markdown, relativeFilepath });
                }

                if (event === "markdown-preview-buffer-delete") {
                    wsSend(ws, { goodbye: true, relativeFilepath });
                    server.close();
                }

                if (event === "markdown-preview-cursor-moved") {
                    const cursorMove = await getCursorMove(nvim, buffer, props);
                    debouncedWsSend(ws, { cursorMove, relativeFilepath });
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
