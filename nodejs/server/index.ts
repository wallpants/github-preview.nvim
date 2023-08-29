import { attach } from "neovim";
import { createServer, type Server } from "node:http";
import opener from "opener";
import { parse } from "valibot";
import { WebSocketServer } from "ws";
import { PluginPropsSchema } from "../types";
import { NVIM_LISTEN_ADDRESS, VITE_GP_PORT } from "./env";
import { initHttpServer } from "./http-server";
import { RPC_EVENTS } from "./on-nvim-notification";
import { onWssConnection } from "./on-wss-connection";
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

    await killExisting(props.port);
    await nvim.lua('print("starting MarkdownPreview server")');

    // TODO more testing with logging
    nvim.logger.error("nvim error");

    const root = findRepoRoot(await nvim.buffer.name);
    if (!root) throw Error("root .git directory NOT FOUND");

    for (const event of RPC_EVENTS) await nvim.subscribe(event);

    const httpServer: Server = createServer((req, res) =>
        initHttpServer({ nvim, httpServer, props, req, res }),
    );

    const wsServer = new WebSocketServer({ server: httpServer });
    wsServer.on(
        "connection",
        onWssConnection({ nvim, httpServer, root, props }),
    );

    !VITE_GP_PORT && opener(`http://localhost:${props.port}`);
    httpServer.listen(props.port);
}

await main();

// nvim.on('request', (method: string, args: any, resp: any) => {
// if (method === 'close_all_pages') {
//   app.closeAllPages()
// }
// resp.send()
// })
// cspell:ignore rpcrequest
// vim.rpcrequest(0, "close_all_pages", {})
