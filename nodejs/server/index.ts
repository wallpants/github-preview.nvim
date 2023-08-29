import { attach } from "neovim";
import { createServer, type Server } from "node:http";
import opener from "opener";
import { parse } from "valibot";
import { WebSocketServer } from "ws";
import { PluginPropsSchema } from "../types";
import { initHttpServer } from "./http-server";
import { RPC_EVENTS } from "./on-nvim-notification";
import { onWssConnection } from "./on-wss-connection";
import { findRepoRoot } from "./utils";

const socket = process.argv[2];

async function killExisting(port: number) {
    try {
        // we check for PORT for dev env
        await fetch(`http://localhost:${port}`, { method: "POST" });
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

    opener(`http://localhost:${props.port}`);
    httpServer.listen(props.port);
}

try {
    await main();
} catch (e) {
    const err = e as Error;
    console.log(err.name);
    console.log("message:", err.message);
    console.log("stack:", err.stack);
}

// nvim.on('request', (method: string, args: any, resp: any) => {
// if (method === 'close_all_pages') {
//   app.closeAllPages()
// }
// resp.send()
// })
// vim.rpcrequest(0, "close_all_pages", {})
