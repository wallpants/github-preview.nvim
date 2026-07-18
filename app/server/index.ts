import { normalize } from "node:path";
import { type Server } from "bun";
import opener from "opener";
import { IMAGE_PREFIX } from "../consts.ts";
import { type GithubPreview } from "../github-preview.ts";
import index from "../web/index.html";
import { websocketHandler } from "./websocket.ts";

export const UNALIVE_URL = "/unalive";

export function startServer<T>(app: GithubPreview, isDev: boolean): Server<T> {
   const { port, host } = app.config.overrides;

   const server = Bun.serve({
      port: port,
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

   opener(`http://${host}:${port}?theme=${JSON.stringify(app.config.overrides.theme)}`);
   return server;
}
