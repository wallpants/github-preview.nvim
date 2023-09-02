import { type NeovimClient } from "neovim";
import { type Server } from "node:http";
import { dirname, extname, relative } from "node:path";
import { type WebSocket } from "ws";
import { type CurrentEntry, type WsServerMessage } from "../../types";
import { onBrowserMessage } from "./on-browser-message";
import { type PluginProps } from "./types";
import { getCursorMove, getDirEntries, getRepoName, textToMarkdown } from "./utils";

interface Args {
    nvim: NeovimClient;
    httpServer: Server;
    root: string;
    props: PluginProps;
}

export function onWssConnection({ nvim, httpServer, root, props }: Args) {
    return async (ws: WebSocket) => {
        const repoName = getRepoName(root);
        const buffer = await nvim.buffer;

        const text = (await buffer.lines).join("\n");
        const cursorMove = await getCursorMove(nvim, props, text.length);

        const wsSend = (m: WsServerMessage) => {
            ws.send(JSON.stringify(m));
        };

        const relativeToRoot = relative(root, await buffer.name);
        const fileExt = extname(relativeToRoot);
        const currentEntry: CurrentEntry = {
            relativeToRoot,
            type: "file",
            content: {
                markdown: textToMarkdown({ text, fileExt }),
                fileExt,
            },
        };

        const entries = await getDirEntries({
            relativeDir: dirname(relativeToRoot),
            root,
        });

        wsSend({
            root,
            cursorMove,
            currentEntry,
            entries,
            repoName,
        });

        ws.on("message", onBrowserMessage({ root, wsSend }));

        // nvim.on(
        //     "notification",
        //     onNvimNotification({ nvim, httpServer, root, props, wsSend }),
        // );
    };
}
