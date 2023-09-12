import { type Server } from "bun";
import { resolve } from "node:path";

const BASE_PATH = resolve(import.meta.dir, "../../../web/dist");

export function onHttpRequest(req: Request, server: Server) {
    const upgradedToWs = server.upgrade(req, {
        data: {}, // this data is available in socket.data
        headers: {},
    });
    if (upgradedToWs) return;

    let relFilePath = new URL(req.url).pathname;
    if (relFilePath === "/") relFilePath += "index.html";

    const file = Bun.file(BASE_PATH + relFilePath);
    return new Response(file);
}
