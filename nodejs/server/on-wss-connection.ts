import { type NeovimClient } from "neovim";
import { type Server } from "node:http";
import { dirname, relative } from "node:path";
import { type WebSocket } from "ws";
import {
    type CurrentEntry,
    type PluginProps,
    type WsServerMessage,
} from "../types";
import { onBrowserMessage } from "./on-browser-message";
import { onNvimNotification } from "./on-nvim-notification";
import { getCursorMove, getDirEntries, getRepoName } from "./utils";

type Args = {
    nvim: NeovimClient;
    httpServer: Server;
    root: string;
    props: PluginProps;
};

export function onWssConnection({ nvim, httpServer, root, props }: Args) {
    return async (ws: WebSocket) => {
        const repoName = getRepoName(root);
        const buffer = await nvim.buffer;

        const markdown = (await buffer.lines).join("\n");
        const cursorMove = await getCursorMove(nvim, props, markdown);

        const wsSend = (m: WsServerMessage) => ws.send(JSON.stringify(m));

        const relativeToRoot = relative(root, await buffer.name);
        const currentEntry: CurrentEntry = {
            relativeToRoot,
            type: "file",
            markdown,
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

        nvim.on(
            "notification",
            onNvimNotification({ nvim, httpServer, root, props, wsSend }),
        );
    };
}
