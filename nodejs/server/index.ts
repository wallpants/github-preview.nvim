import { attach } from "neovim";
import { createServer, type Server } from "node:http";
import opener from "opener";
import { parse } from "valibot";
import { WebSocketServer } from "ws";
import { PluginPropsSchema } from "../types";
import { PORT, SOCKET } from "./env";
import { initHttpServer } from "./http-server";
import { RPC_EVENTS } from "./on-nvim-notification";
import { onWssConnection } from "./on-wss-connection";
import { findRepoRoot } from "./utils";

// we check for SOCKET for dev env
const socket = SOCKET || process.argv[2];

async function killExisting(port: number) {
    try {
        // we check for PORT for dev env
        await fetch(`http://localhost:${PORT || port}`, { method: "POST" });
    } catch (err) {
        console.log("no server to kill");
    }
}

if (!socket) throw Error("missing socket");
const nvim = attach({ socket });

const props = parse(
    PluginPropsSchema,
    await nvim.getVar("markdown_preview_props"),
);

await killExisting(props.port);
await nvim.lua('print("starting MarkdownPreview server")');

const root = findRepoRoot(props.filepath);
if (!root) throw Error("root .git directory NOT FOUND");

for (const event of RPC_EVENTS) await nvim.subscribe(event);

const httpServer: Server = createServer((req, res) =>
    initHttpServer(nvim, httpServer, props, req, res),
);

const wsServer = new WebSocketServer({ server: httpServer });
wsServer.on("connection", onWssConnection(nvim, httpServer, root, props));

// we check for PORT for dev env
const port = PORT || props.port;
// don't open browser in dev, webapp is hosted on other port
if (!PORT) opener(`http://localhost:${port}`);
httpServer.listen(port);

// nvim.on('request', (method: string, args: any, resp: any) => {
// if (method === 'close_all_pages') {
//   app.closeAllPages()
// }
// resp.send()
// })
// vim.rpcrequest(0, "close_all_pages", {})
