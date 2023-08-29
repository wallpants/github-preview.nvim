import { type NeovimClient } from "neovim";
import {
    type IncomingMessage,
    type Server,
    type ServerResponse,
} from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import handler from "serve-handler";
import { RPC_EVENTS } from "./on-nvim-notification";
import { type PluginProps } from "./types";

interface Args {
    nvim: NeovimClient;
    httpServer: Server;
    props: PluginProps;
}

export function httpRequestHandler({ nvim, httpServer }: Args) {
    return async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method === "POST") {
            res.writeHead(200).end();
            for (const event of RPC_EVENTS) await nvim.unsubscribe(event);
            httpServer.close();
        }

        // if (req.url?.startsWith(LOCAL_FILE_ROUTE)) {
        //     return localFileHandler(req, res, props.filepath);
        // }

        return handler(req, res, {
            public: fileURLToPath(
                resolve(dirname(import.meta.url), "../../web/dist"),
            ),
            rewrites: [{ source: "**", destination: "/index.html" }],
            headers: [
                {
                    source: "**",
                    headers: [{ key: "Cache-Control", value: "no-cache" }],
                },
            ],
        });
    };
}
