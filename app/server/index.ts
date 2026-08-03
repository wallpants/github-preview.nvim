import { normalize } from "node:path";
import { type Server } from "bun";
import opener from "opener";
import { IMAGE_PREFIX } from "../consts.ts";
import { type GithubPreview } from "../github-preview.ts";
import index from "../web/index.html";
import { websocketHandler } from "./websocket.ts";

export const UNALIVE_URL = "/unalive";

/**
 * Ports we attempt to bind before giving up when
 * allow_multiple_instances is enabled
 */
const MAX_PORT_ATTEMPTS = 20;

export function startServer<T>(app: GithubPreview, isDev: boolean): Server<T> {
   const { port, host, allow_multiple_instances } = app.config.overrides;

   const serve = (p: number) =>
      Bun.serve({
         port: p,
         // Bun silently enables SO_REUSEPORT for servers with "routes",
         // which lets two instances bind the same port without EADDRINUSE.
         // We rely on that error to detect taken ports.
         reusePort: false,
         routes: {
            [IMAGE_PREFIX + "*"]: (req: Request) => {
               app.nvim.logger?.info({ route: req.url });
               const pathname = new URL(req.url).pathname;
               let filePath: string;
               try {
                  filePath = decodeURIComponent(pathname.replace(IMAGE_PREFIX, ""));
               } catch (_err) {
                  return new Response(null, { status: 400 });
               }
               // do not serve any files outside of repo root
               const fullPath = normalize(app.root + filePath);
               if (!fullPath.startsWith(app.root)) {
                  return new Response(null, { status: 404 });
               }
               app.nvim.logger?.info({ filePath: fullPath });
               // images with relative sources
               const file = Bun.file(fullPath);
               return new Response(file);
            },
            [UNALIVE_URL]: async (req) => {
               app.nvim.logger?.info({ route: req.url });
               // This endpoint is called when starting the service to kill
               // github-preview instances started by other nvim instances
               await app.goodbye();
               app.nvim.detach();
               process.exit(0);
            },
            "/*": index,
         },
         fetch: (req: Request, server: Server<undefined>) => {
            app.nvim.logger?.info({ fetchUrl: req.url });
            const upgradedToWs = server.upgrade(req);
            if (upgradedToWs) {
               // If client (browser) requested to upgrade connection to websocket
               // and we successfully upgraded request
               return;
            }
         },
         websocket: websocketHandler(app),
         development: isDev,
      });

   let server: Server<undefined> | undefined;
   let boundPort = port;
   const maxAttempts = allow_multiple_instances ? MAX_PORT_ATTEMPTS : 1;

   for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
         boundPort = port + attempt;
         server = serve(boundPort);
         break;
      } catch (err) {
         // binding instead of checking-then-binding avoids racing
         // other processes for the port
         const portTaken = err instanceof Error && "code" in err && err.code === "EADDRINUSE";
         if (!portTaken || attempt === maxAttempts - 1) throw err;
      }
   }
   if (!server) throw Error("github-preview: could not find a free port");

   // keep config in sync with the port we actually bound,
   // it may differ from the requested one when allow_multiple_instances is enabled
   app.config.overrides.port = boundPort;

   opener(`http://${host}:${boundPort}?theme=${JSON.stringify(app.config.overrides.theme)}`);
   return server as Server<T>;
}
