import { type BrowserState, type PluginInit } from "@gp/shared";
import { attach } from "bunvim";
import { getContent, getEntries, getRepoName } from "./utils.ts";

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket missing");

const nvim = await attach<{ "event-1": [number] }>({ socket: SOCKET });
const init = (await nvim.call("nvim_get_var", ["github_preview_init"])) as PluginInit;

const entries = await getEntries({
    root: init.root,
    currentPath: init.path,
});

const { currentPath, content, cursorLine } = getContent({
    currentPath: init.root,
    entries,
    newContent: init.content,
});

const browserState: BrowserState = {
    root: init.root,
    repoName: getRepoName({ root: init.root }),
    entries: entries,
    content,
    currentPath,
    disableSyncScroll: init.disable_sync_scroll,
    cursorLine: cursorLine !== undefined ? cursorLine : init.cursor_line,
};

nvim.onNotification("event-1", (args) => {
    console.log("args: ", args);
});

// const webServer = startWebServer(init, browserState);

// for (const event of EVENT_NAMES) await nvim.call("nvim_subscribe", [event]);

// nvim.onNotification(async (event, [arg]) => {
//     logger.verbose(`unixSocket event={${event}}`, arg);

//     if (event === "github-preview-cursor-move") {
//         await onCursorMove(browserState, webServer, arg);
//     }

//     if (event === "github-preview-content-change") {
//         await onContentChange(browserState, webServer, arg);
//     }
// });
