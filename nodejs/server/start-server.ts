import { type NeovimClient } from "neovim";
import { createServer, type Server } from "node:http";
import opener from "opener";
import { WebSocketServer } from "ws";
import { type PluginProps } from "../types";
import { PORT } from "./env";
import { initHttpServer } from "./http-server";
import { RPC_EVENTS } from "./on-nvim-notification";
import { onWssConnection } from "./on-wss-connection";
import { findRepoRoot } from "./utils";

export async function startServer(nvim: NeovimClient, props: PluginProps) {
    await nvim.lua('print("starting MarkdownPreview server")');

    const root = findRepoRoot(props.filepath);
    if (!root) throw Error("root .git directory NOT FOUND");
    for (const event of RPC_EVENTS) await nvim.subscribe(event);

    const httpServer: Server = createServer((req, res) =>
        initHttpServer({ httpServer, req, res, nvim, props }),
    );

    const wsServer = new WebSocketServer({ server: httpServer });

    wsServer.on(
        "connection",
        onWssConnection({ nvim, root, props, httpServer }),
    );

    // we check for PORT for dev env
    const port = PORT || props.port;
    // don't open browser in dev, webapp is hosted on other port
    if (!PORT) opener(`http://localhost:${port}`);
    httpServer.listen(port);
}
