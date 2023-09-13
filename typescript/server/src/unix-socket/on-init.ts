import { ENV, PluginInitSchema, type PluginInit } from "@gp/shared";
import { type Socket } from "bun";
import opener from "opener";
import { parse } from "valibot";
import { getContent, getEntries, getRepoName } from "../utils.ts";
import { startWebServer } from "../web-server/index.ts";
import { type UnixSocketMetadata } from "./types.ts";

let PORT: number | undefined;

// TODO(gualcasas): make a create response method, we follow the same logic pretty much
// every time we send a message to the browser.
//
// Has the currentPath changed? Include the new content and entries
// is the path a dir? look for README.md

export async function onInit(unixSocket: Socket<UnixSocketMetadata>, _init: PluginInit) {
    ENV.IS_DEV && parse(PluginInitSchema, _init);

    // We start a new httpServer per unixSocket connection and increment port
    if (!PORT) PORT = _init.port;
    const init: PluginInit = { ..._init, port: PORT++ };

    const entries = await getEntries({
        root: init.root,
        currentPath: init.path,
    });

    const { currentPath, content } = getContent({ currentPath: init.root, entries });

    unixSocket.data = {
        browserState: {
            root: init.root,
            repoName: getRepoName({ root: init.root }),
            entries: entries,
            content,
            currentPath,
            disableSyncScroll: init.disable_sync_scroll,
        },
    };

    unixSocket.data.webServer = startWebServer(init, unixSocket);
    if (!ENV.IS_DEV) opener(`http://localhost:${init.port}`);

    // const wsServer = new WebSocketServer({ server: httpServer });
    // wsServer.on("connection", onWssConnection({ ipc, init }));

    // const PORT = ENV.VITE_GP_IS_DEV ? ENV.VITE_GP_WS_PORT : init.port;

    // httpServer.listen(PORT, () => {
    //     logger.verbose(`Server is listening on port ${PORT}`);
    //     if (!ENV.VITE_GP_IS_DEV) opener(`http://localhost:${PORT}`);
    // });
}
