import { type NeovimClient } from "neovim";
import { type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { resolve } from "node:path";
import handler from "serve-handler";
import { RPC_EVENTS } from "./on-nvim-notification";

interface Args {
    nvim: NeovimClient;
    httpServer: Server;
}

export function onHttpRequest({ nvim, httpServer }: Args) {
    return async (req: IncomingMessage, res: ServerResponse) => {
        console.log("req.url: ", req.url);

        if (req.method === "POST") {
            res.writeHead(200).end();
            for (const event of RPC_EVENTS) await nvim.unsubscribe(event);
            httpServer.close();
        }

        // if (req.url?.startsWith(LOCAL_FILE_ROUTE)) {
        //     return localFileHandler(req, res, props.filepath);
        // }

        return handler(req, res, {
            public: resolve(__dirname, "../../web/dist"),
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
