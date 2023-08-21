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
    "markdown-preview-text-change",
    "markdown-preview-cursor-moved",
    "markdown-preview-buffer-delete",
] as const;

async function wsSendBufferContent(ws: WebSocket, buffer: AsyncBuffer) {
    const bufferLines = await buffer.lines;
    const markdown = bufferLines.join("\n");
    const message: ServerMessage = {
        markdown,
    };
    ws.send(JSON.stringify(message));
}

export async function startServer(nvim: NeovimClient, PORT: number) {
    await nvim.lua('print("starting MarkdownPreview server")');

    const server = createServer((req, res) => {
        return handler(req, res, {
            public: fileURLToPath(dirname(import.meta.url)),
        });
    });
    const wss = new WebSocketServer({ server });

    const bufferId = Number(await nvim.getVar("markdown_preview_buffer_id"));
    const buffers = (await nvim.buffers) as AsyncBuffer[];
    const buffer = buffers.find(async (b) => (await b).id === bufferId)!;

    wss.on("connection", async (ws, _req) => {
        for (const event of RPC_EVENTS) {
            await nvim.subscribe(event);
        }
        await wsSendBufferContent(ws, buffer);

        nvim.on(
            "notification",
            async (
                event: (typeof RPC_EVENTS)[number],
                [_arg]: NeovimNotificationArgs,
            ) => {
                if (event === "markdown-preview-text-change") {
                    await wsSendBufferContent(ws, buffer);
                }

                if (event === "markdown-preview-buffer-delete") {
                    ws.close();
                }
            },
        );

        ws.on("close", () => {
            server.close();
        });
    });

    opener(`http://localhost:${PORT}`);
    server.listen(PORT);
}
