import { ENV, type BrowserState } from "@gp/shared";
import { type Server } from "bun";
import { type Nvim } from "bunvim";
import opener from "opener";
import { type CustomEvents } from "../types.ts";
import { httpHandler } from "./http.ts";
import { websocketHandler } from "./websocket.ts";

export function startServer(
    port: number,
    browserState: BrowserState,
    nvim: Nvim<CustomEvents>,
): Server {
    const server = Bun.serve({
        port: port,
        fetch: httpHandler,
        websocket: websocketHandler(nvim, browserState),
    });

    if (!ENV.IS_DEV) opener(`http://localhost:${port}`);
    return server;
}
