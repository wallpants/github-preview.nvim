import { type Server } from "bun";
import { renderToReadableStream } from "react-dom/server";
import { ENV } from "../env.ts";
import { Index } from "../web/index.tsx";

const appRoot = import.meta.dir + "/..";

const host = "localhost";

export function httpHandler(port: number) {
    return async (req: Request, server: Server) => {
        const upgradedToWs = server.upgrade(req, {
            data: {}, // this data is available in socket.data
            headers: {},
        });
        if (upgradedToWs) return;

        const { pathname } = new URL(req.url);

        if (pathname === "/hydrate.js") {
            const { outputs } = await Bun.build({
                entrypoints: [appRoot + "/web" + "/hydrate.tsx"],
                define: {
                    __GP_HOST__: JSON.stringify(host),
                    __GP_PORT__: JSON.stringify(port),
                    __DEV__: JSON.stringify(Boolean(ENV.GP_LOG_LEVEL)),
                },
            });

            return new Response(outputs[0]);
        }

        const file = Bun.file(appRoot + "/web" + pathname);

        if (await file.exists()) {
            return new Response(file);
        }

        const stream = await renderToReadableStream(<Index />, {
            bootstrapModules: ["/hydrate.js"],
        });

        return new Response(stream);
    };
}
