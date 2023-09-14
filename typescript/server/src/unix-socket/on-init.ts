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

    const { currentPath, content, cursorLine } = getContent({
        currentPath: init.root,
        entries,
        newContent: init.content,
    });

    unixSocket.data = {
        browserState: {
            root: init.root,
            repoName: getRepoName({ root: init.root }),
            entries: entries,
            content,
            currentPath,
            disableSyncScroll: init.disable_sync_scroll,
            cursorLine: cursorLine !== undefined ? cursorLine : init.cursor_line,
        },
    };

    unixSocket.data.webServer = startWebServer(init, unixSocket);
    if (!ENV.IS_DEV) opener(`http://localhost:${init.port}`);
}
