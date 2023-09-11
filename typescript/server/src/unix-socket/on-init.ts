import { ENV, PluginInitSchema, type PluginInit } from "@gp/shared";
import { type Socket } from "bun";
import opener from "opener";
import { parse } from "valibot";
import { getContent, getEntries, getRepoName } from "../utils";
import { startWebServer } from "../web-server";
import { type UnixSocketMetadata } from "./types";

let PORT: number | undefined;

export async function onInit(unixSocket: Socket<UnixSocketMetadata>, _init: PluginInit) {
    ENV.IS_DEV && parse(PluginInitSchema, _init);

    // We start a new httpServer per unixSocket connection and increment port
    if (!PORT) PORT = _init.port;
    const init: PluginInit = { ..._init, port: PORT++ };

    const entries = await getEntries({
        root: init.root,
        currentPath: init.path,
    });

    unixSocket.data = {
        browserState: {
            root: init.root,
            repoName: getRepoName({ root: init.root }),
            currentPath: init.path,
            entries: entries,
            content: getContent({ currentPath: init.root, entries }),
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
