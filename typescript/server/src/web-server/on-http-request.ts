import { type Server } from "bun";
import { resolve } from "node:path";

const BASE_PATH = resolve(import.meta.dir, "../../../web/dist");

export async function onHttpRequest(req: Request, server: Server) {
    const upgradedToWs = server.upgrade(req, {
        data: {}, // this data is available in socket.data
        headers: {},
    });
    if (upgradedToWs) return;

    const relFilePath = new URL(req.url).pathname;
    const file = Bun.file(BASE_PATH + relFilePath);

    if (await file.exists()) {
        return new Response(file);
    }

    const index = Bun.file(BASE_PATH + "/index.html");
    return new Response(index);
}
