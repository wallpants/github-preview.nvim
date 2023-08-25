import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer.js";
import { createServer } from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import opener from "opener";
import handler from "serve-handler";
import { WebSocketServer, type WebSocket } from "ws";
import { type NeovimNotificationArgs, type ServerMessage } from "../types.js";

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

export async function startServer(nvim: NeovimClient, PORT: number) {
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

    const bufferId = Number(await nvim.getVar("markdown_preview_buffer_id"));
    const buffers = (await nvim.buffers) as AsyncBuffer[];
    const buffer = buffers.find(async (b) => (await b).id === bufferId)!;

    for (const event of RPC_EVENTS) {
        await nvim.subscribe(event);
    }

    wss.on("connection", async (ws, _req) => {
        const markdown = await getBufferContent(buffer);
        wsSend(ws, { markdown });

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
                    const currentWindow = await nvim.window;
                    const winLine = Number(await nvim.call("winline"));
                    const winHeight = await currentWindow.height;
                    const [cursorLine] = await currentWindow.cursor;
                    const markdown = await getBufferContent(buffer);
                    wsSend(ws, {
                        cursorMove: {
                            cursorLine,
                            markdownLen: markdown.length,
                            winHeight,
                            winLine,
                        },
                    });
                }
            },
        );
    });

    opener(`http://localhost:${PORT}`);
    server.listen(PORT);
}
