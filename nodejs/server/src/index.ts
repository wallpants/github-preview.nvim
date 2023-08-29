import { attach } from "neovim";
import { createServer } from "node:http";
import opener from "opener";
import { parse } from "valibot";
import { WebSocketServer } from "ws";
import { NVIM_LISTEN_ADDRESS, VITE_GP_PORT } from "./env";
import { onHttpRequest } from "./on-http-request";
import { RPC_EVENTS } from "./on-nvim-notification";
import { onWssConnection } from "./on-wss-connection";
import { PluginPropsSchema } from "./types";
import { findRepoRoot } from "./utils";

// if GP_PORT defined, we're on dev env
// we don't directly load NVIM_LISTEN_ADDRESS, because
// it might be set for someone else
const socket = VITE_GP_PORT ? NVIM_LISTEN_ADDRESS : process.argv[2];

async function killExisting(port: number) {
    try {
        // we check for PORT for dev env
        await fetch(`http://localhost:${port}`, { method: "POST" });
        console.log("innocent server killed");
    } catch (err) {
        console.log("no server to kill");
    }
}

async function main() {
    if (!socket) throw Error("missing socket");
    const nvim = attach({ socket });

    const props = parse(
        PluginPropsSchema,
        await nvim.getVar("markdown_preview_props"),
    );

    const PORT = Number(VITE_GP_PORT ?? props.port);

    await killExisting(PORT);
    await nvim.lua('print("starting MarkdownPreview server")');

    // TODO more testing with logging
    nvim.logger.error("nvim error");

    const root = findRepoRoot(await nvim.buffer.name);
    if (!root) throw Error("root .git directory NOT FOUND");

    for (const event of RPC_EVENTS) await nvim.subscribe(event);

    const httpServer = createServer();
    httpServer.on("request", onHttpRequest({ nvim, httpServer, props }));

    const wsServer = new WebSocketServer({ server: httpServer });
    wsServer.on(
        "connection",
        onWssConnection({ nvim, httpServer, root, props }),
    );

    !VITE_GP_PORT && opener(`http://localhost:${PORT}`);
    httpServer.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}

try {
    await main();
} catch (err) {
    console.log(err);
}
