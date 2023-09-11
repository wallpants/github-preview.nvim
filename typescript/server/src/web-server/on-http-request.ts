import { type Server } from "bun";
import { resolve } from "node:path";

export function onHttpRequest(req: Request, server: Server) {
    const upgradedToWs = server.upgrade(req, {
        data: {}, // this data is available in socket.data
        headers: {},
    });
    if (upgradedToWs) return;

    return new Response(Bun.file(resolve(import.meta.url, "../../web/dist/index.html")));
}
