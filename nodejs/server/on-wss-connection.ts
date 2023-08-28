import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { type Server } from "node:http";
import { dirname, relative } from "node:path";
import { type WebSocket } from "ws";
import { type Entry, type PluginProps, type WsServerMessage } from "../types";
import { onClientMessage } from "./on-client-message";
import { onNvimNotification } from "./on-nvim-notification";
import { getCursorMove, getDirEntries, getRepoName } from "./utils";

export type OnWssConnectionArgs = {
    nvim: NeovimClient;
    root: string;
    props: PluginProps;
    httpServer: Server;
};

export function onWssConnection({
    root,
    nvim,
    props,
    httpServer,
}: OnWssConnectionArgs) {
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
        const cursorMove = await getCursorMove(nvim, buffer, props);
        const entry: Entry = {
            relativeToRoot: relative(root, props.filepath),
            type: "file",
        };

        const wsSend = (m: WsServerMessage) => ws.send(JSON.stringify(m));

        wsSend({
            root,
            markdown,
            cursorMove,
            entry,
            entries,
            repoName,
        });

        ws.on("message", onClientMessage({ wsSend, root }));

        nvim.on(
            "notification",
            onNvimNotification({
                props,
                root,
                nvim,
                httpServer,
                wsSend,
            }),
        );
    };
}
