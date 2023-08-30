import { attach } from "neovim";
import { createServer } from "node:http";
import opener from "opener";
import { parse } from "valibot";
import { WebSocketServer } from "ws";
import { NVIM_LISTEN_ADDRESS, VITE_GP_PORT } from "../env";
import { onHttpRequest } from "./on-http-request";
import { RPC_EVENTS } from "./on-nvim-notification";
import { onWssConnection } from "./on-wss-connection";
import { PluginPropsSchema } from "./types";
import { findRepoRoot } from "./utils";

const socket = NVIM_LISTEN_ADDRESS ?? process.argv[2];
const IS_DEV = Boolean(VITE_GP_PORT);

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

    const root = findRepoRoot(props.cwd);
    // TODO: better logging
    if (!root) throw Error("root .git directory NOT FOUND");

    for (const event of RPC_EVENTS) await nvim.subscribe(event);

    const httpServer = createServer();
    httpServer.on("request", onHttpRequest({ nvim, httpServer, props }));

    const wsServer = new WebSocketServer({ server: httpServer });
    wsServer.on(
        "connection",
        onWssConnection({ nvim, httpServer, root, props }),
    );

    !IS_DEV && opener(`http://localhost:${PORT}`);
    httpServer.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}

try {
    await main();
} catch (err) {
    console.log(err);
}
