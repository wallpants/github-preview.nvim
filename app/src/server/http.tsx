import { type Server } from "bun";
import { renderToReadableStream } from "react-dom/server";
import { ENV } from "../env.ts";
import { GP_STATIC_PREFIX, Index } from "../web/index.tsx";
import { GP_LOCALIMAGE_PREFIX } from "../web/markdown/index.tsx";

const webRoot = import.meta.dir + "/../web/";

const host = "localhost";

export function httpHandler(port: number, root: string) {
    return async (req: Request, server: Server) => {
        const upgradedToWs = server.upgrade(req, {
            data: {}, // this data is available in socket.data
            headers: {},
        });
        if (upgradedToWs) return;

        const { pathname } = new URL(req.url);

        if (pathname.startsWith(GP_STATIC_PREFIX)) {
            const requested = pathname.slice(GP_STATIC_PREFIX.length);

            if (requested === "hydrate.js") {
                const { outputs } = await Bun.build({
                    entrypoints: [webRoot + "hydrate.tsx"],
                    define: {
                        __GP_HOST__: JSON.stringify(host),
                        __GP_PORT__: JSON.stringify(port),
                        __DEV__: JSON.stringify(Boolean(ENV.GP_LOG_LEVEL)),
                    },
                });

                return new Response(outputs[0]);
            }

            const file = Bun.file(webRoot + requested);
            return new Response(file);
        }

        if (pathname.startsWith(GP_LOCALIMAGE_PREFIX)) {
            const requested = pathname.slice(GP_LOCALIMAGE_PREFIX.length);
            const file = Bun.file(root + requested);
            return new Response(file);
        }

        const stream = await renderToReadableStream(<Index />, {
            bootstrapModules: [`${GP_STATIC_PREFIX}hydrate.js`],
        });

        return new Response(stream);
    };
}
