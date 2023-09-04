import { type IncomingMessage, type ServerResponse } from "node:http";
import { resolve } from "node:path";
import handler from "serve-handler";
import { logger } from "./logger";

export function onHttpRequest(req: IncomingMessage, res: ServerResponse) {
    // if (req.url?.startsWith(LOCAL_FILE_ROUTE)) {
    //     return localFileHandler(req, res, props.filepath);
    // }

    handler(req, res, {
        public: resolve(__dirname, "../../web/dist"),
        rewrites: [{ source: "**", destination: "/index.html" }],
        headers: [
            {
                source: "**",
                headers: [{ key: "Cache-Control", value: "no-cache" }],
            },
        ],
    }).catch((e) => logger.error("onHttpRequest.handler ERROR", e));
}
