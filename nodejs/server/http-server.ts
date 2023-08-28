import { type NeovimClient } from "neovim";
import {
    type IncomingMessage,
    type Server,
    type ServerResponse,
} from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import handler from "serve-handler";
import { type PluginProps } from "../types";
import { RPC_EVENTS } from "./on-nvim-notification";

export async function initHttpServer(
    nvim: NeovimClient,
    httpServer: Server,
    _props: PluginProps,
    req: IncomingMessage,
    res: ServerResponse,
) {
    if (req.method === "POST") {
        res.writeHead(200).end();
        for (const event of RPC_EVENTS) await nvim.unsubscribe(event);
        httpServer.close();
    }

    // if (req.url?.startsWith(LOCAL_FILE_ROUTE)) {
    //     return localFileHandler(req, res, props.filepath);
    // }

    return handler(req, res, {
        public: fileURLToPath(dirname(import.meta.url)),
        rewrites: [{ source: "**", destination: "/index.html" }],
        headers: [
            {
                source: "**",
                headers: [{ key: "Cache-Control", value: "no-cache" }],
            },
        ],
    });
}
