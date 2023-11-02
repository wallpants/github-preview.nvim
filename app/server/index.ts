import { type Server } from "bun";
import opener from "opener";
import { type GithubPreview } from "../github-preview.ts";
import { httpHandler } from "./http.ts";
import { websocketHandler } from "./websocket.ts";

export function startServer(app: GithubPreview): Server {
    const { port, host } = app.config.overrides;

    const server = Bun.serve({
        port: port,
        fetch: httpHandler(app),
        websocket: websocketHandler(app),
    });

    opener(`http://${host}:${port}`);
    return server;
}
