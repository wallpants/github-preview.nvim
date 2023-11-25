import { type BunPlugin, type Server } from "bun";
import { type GithubPreview } from "../github-preview";

const webRoot = import.meta.dir + "/../web";
export const UNALIVE_URL = "/unalive";

const GP_PREFIX = "/__github_preview__";

// mock loader to prevent crashing production build
// during dev, we import the file dev-tailwind.css to enable hot-reload with vite,
// bun does not have a loader for css,
// that's why we manually run `bun run tailwind:compile`
const mockCssLoader: BunPlugin = {
    name: "Mock CSS Loader",
    setup(builder) {
        builder.onLoad({ filter: /\.css$/ }, () => ({
            contents: "",
        }));
    },
};

export function httpHandler(app: GithubPreview) {
    return async (req: Request, server: Server) => {
        const upgradedToWs = server.upgrade(req, {
            data: {}, // this data is available in socket.data
            headers: {},
        });
        if (upgradedToWs) {
            // If client (browser) requested to upgrade connection to websocket
            // and we successfully upgraded request
            return;
        }

        const { pathname } = new URL(req.url);

        app.nvim.logger?.verbose({ HTTP: pathname });

        if (pathname === UNALIVE_URL) {
            // This endpoint is called when starting the service to kill
            // github-preview instances started by other nvim instances
            await app.goodbye();
            app.nvim.detach();
            process.exit(0);
        }

        if (pathname.startsWith(GP_PREFIX)) {
            // static files (js, img, css)
            const requested = pathname.slice(GP_PREFIX.length);

            if (requested.startsWith("/image/")) {
                // images with relative sources
                const file = Bun.file(app.root + requested.slice("/image/".length));
                return new Response(file);
            }

            if (requested === "/index.tsx") {
                const { outputs } = await Bun.build({
                    entrypoints: [webRoot + requested],
                    plugins: [mockCssLoader],
                    define: {
                        __HOST__: JSON.stringify(app.config.dotfiles.host),
                        __PORT__: JSON.stringify(app.config.dotfiles.port),
                        __IS_DEV__: JSON.stringify(false),
                        __THEME__: JSON.stringify(app.config.overrides.theme),
                    },
                });

                return new Response(outputs[0], {
                    headers: { "content-type": "text/javascript" },
                });
            }

            if (requested === "/pantsdown.css") {
                const pantsdownCss = Bun.resolveSync("pantsdown/styles.css", import.meta.dir);
                const file = Bun.file(pantsdownCss);
                return new Response(file, {
                    headers: { "content-type": "text/css" },
                });
            }

            if (requested === "/mermaid.js") {
                const mermaid = Bun.resolveSync("mermaid/dist/mermaid.min.js", import.meta.dir);
                const file = Bun.file(mermaid);
                return new Response(file, {
                    headers: { "content-type": "text/javascript" },
                });
            }

            const file = Bun.file(webRoot + requested);
            return new Response(file);
        }

        // If none of the previous cases match the request, the client (browser) is
        // probably making its first request to get index.html
        const index = Bun.file(webRoot + "/index.html");
        return new Response(index);
    };
}
