import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
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

export function onWssConnection(
    nvim: NeovimClient,
    httpServer: Server,
    root: string,
    props: PluginProps,
) {
    return async (ws: WebSocket) => {
        const repoName = getRepoName(root);
        const buffers = (await nvim.buffers) as AsyncBuffer[];
        const buffer = buffers.find(
            async (b) => (await b).name === props.filepath,
        )!;

        const entries = await getDirEntries({
            relativeDir: relative(root, dirname(props.filepath)),
            root,
        });

        const markdown = (await buffer.lines).join("\n");
        const cursorMove = await getCursorMove(nvim, props, markdown);

        const wsSend = (m: WsServerMessage) => ws.send(JSON.stringify(m));

        const currentEntry: CurrentEntry = {
            relativeToRoot: relative(root, props.filepath),
            type: "file",
            markdown,
        };

        wsSend({
            root,
            cursorMove,
            currentEntry,
            entries,
            repoName,
        });

        ws.on("message", onBrowserMessage(root, wsSend));

        nvim.on(
            "notification",
            onNvimNotification(nvim, httpServer, root, props, wsSend),
        );
    };
}
