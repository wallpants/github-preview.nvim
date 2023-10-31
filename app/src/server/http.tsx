import { type BunPlugin, type Server } from "bun";
import { type Nvim } from "bunvim";
import pantsdownCss from "pantsdown/styles.css";

const webRoot = import.meta.dir + "/../web";
export const unaliveURL = "/unalive";

const GP_PREFIX = "/__github_preview__";

// mock loader to prevent crashing production build
// provider/provider.tsx
const mockCssLoader: BunPlugin = {
    name: "Mock CSS Loader",
    setup(builder) {
        builder.onLoad({ filter: /\.css$/ }, () => ({
            contents: "",
        }));
    },
};

export function httpHandler(host: string, port: number, root: string, nvim: Nvim) {
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

        if (pathname === unaliveURL) {
            // This endpoint is called when starting the service to kill
            // github-preview instances started by other nvim instances
            nvim.detach();
            process.exit(0);
        }

        if (pathname === "/__main__.tsx") {
            const { outputs } = await Bun.build({
                entrypoints: [webRoot + pathname],
                plugins: [mockCssLoader],
                define: {
                    __HOST__: JSON.stringify(host),
                    __PORT__: JSON.stringify(port),
                    __DEV__: JSON.stringify(false),
                },
            });

            return new Response(outputs[0], {
                headers: { "content-type": "text/javascript" },
            });
        }

        if (pathname.startsWith(GP_PREFIX)) {
            // static files (js, img, css)
            const requested = pathname.slice(GP_PREFIX.length);

            if (requested.startsWith("/image/")) {
                // images with relative sources
                const file = Bun.file(root + requested.slice("/image/".length));
                return new Response(file);
            }

            if (requested === "/static/pantsdown.css") {
                const file = Bun.file(pantsdownCss);
                return new Response(file, {
                    headers: { "content-type": "text/css" },
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
