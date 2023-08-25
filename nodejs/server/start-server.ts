import { debounce } from "lodash-es";
import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { createServer } from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import opener from "opener";
import handler from "serve-handler";
import { WebSocketServer, type WebSocket } from "ws";
import {
    type CursorMove,
    type NeovimNotificationArgs,
    type PluginProps,
    type ServerMessage,
} from "../types";

const RPC_EVENTS = [
    "markdown-preview-text-changed",
    "markdown-preview-cursor-moved",
    "markdown-preview-buffer-delete",
] as const;

function wsSend(ws: WebSocket, message: ServerMessage) {
    ws.send(JSON.stringify(message));
}

async function getBufferContent(buffer: AsyncBuffer) {
    const bufferLines = await buffer.lines;
    return bufferLines.join("\n");
}

async function getCursorMove(
    nvim: NeovimClient,
    buffer: AsyncBuffer,
    props: PluginProps,
): Promise<CursorMove | undefined> {
    if (props.disable_sync_scroll) return undefined;
    const currentWindow = await nvim.window;
    const winLine = Number(await nvim.call("winline"));
    const winHeight = await currentWindow.height;
    const [cursorLine] = await currentWindow.cursor;
    const markdown = await getBufferContent(buffer);
    return {
        cursorLine,
        markdownLen: markdown.length,
        winHeight,
        winLine,
        sync_scroll_type: props.sync_scroll_type,
    };
}

export async function startServer(nvim: NeovimClient, props: PluginProps) {
    await nvim.lua('print("starting MarkdownPreview server")');

    const server = createServer((req, res) => {
        if (req.method === "POST") {
            res.writeHead(200).end();
            server.close();
        }
        return handler(req, res, {
            public: fileURLToPath(dirname(import.meta.url)),
        });
    });
    const wss = new WebSocketServer({ server });

    const buffers = (await nvim.buffers) as AsyncBuffer[];
    const buffer = buffers.find(async (b) => (await b).id === props.buffer_id)!;

    for (const event of RPC_EVENTS) {
        await nvim.subscribe(event);
    }

    const debouncedWsSend = debounce(
        (ws: WebSocket, message: ServerMessage) => wsSend(ws, message),
        props.scroll_debounce_ms,
        { leading: false, trailing: true },
    );

    wss.on("connection", async (ws, _req) => {
        const markdown = await getBufferContent(buffer);
        const cursorMove = await getCursorMove(nvim, buffer, props);
        wsSend(ws, { markdown, cursorMove });

        nvim.on(
            "notification",
            async (
                event: (typeof RPC_EVENTS)[number],
                [_arg]: NeovimNotificationArgs,
            ) => {
                if (event === "markdown-preview-text-changed") {
                    const markdown = await getBufferContent(buffer);
                    wsSend(ws, { markdown });
                }

                if (event === "markdown-preview-buffer-delete") {
                    wsSend(ws, { goodbye: true });
                    server.close();
                }

                if (event === "markdown-preview-cursor-moved") {
                    const cursorMove = await getCursorMove(nvim, buffer, props);
                    debouncedWsSend(ws, { cursorMove });
                }
            },
        );
    });

    opener(`http://localhost:${props.port}`);
    server.listen(props.port);
}
