import { debounce } from "lodash-es";
import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { type Server } from "node:http";
import { relative } from "node:path";
import {
    type Entry,
    type NeovimNotificationArg,
    type PluginProps,
    type WsServerMessage,
} from "../types";
import { getCursorMove } from "./utils";

export const RPC_EVENTS = [
    "markdown-preview-text-changed",
    "markdown-preview-cursor-moved",
    "markdown-preview-buffer-delete",
] as const;

type Args = {
    props: PluginProps;
    root: string;
    nvim: NeovimClient;
    httpServer: Server;
    wsSend: (w: WsServerMessage) => void;
};

export function onNvimNotification({
    props,
    root,
    nvim,
    httpServer,
    wsSend,
}: Args) {
    const debouncedWsSend = debounce(wsSend, props.scroll_debounce_ms, {
        leading: false,
        trailing: true,
    });

    return async (
        event: (typeof RPC_EVENTS)[number],
        [arg]: NeovimNotificationArg[],
    ) => {
        const entry: Entry = {
            relativeToRoot: relative(root, arg.file),
            type: "file",
        };

        if (event === "markdown-preview-buffer-delete") {
            wsSend({ root, goodbye: true, entry });
            httpServer.close();
            return;
        }

        const buffers = (await nvim.buffers) as AsyncBuffer[];
        const buffer = buffers.find(async (b) => (await b).name === arg.file)!;

        if (event === "markdown-preview-text-changed") {
            const markdown = (await buffer.lines).join("\n");
            wsSend({ root, markdown, entry });
            return;
        }

        if (event === "markdown-preview-cursor-moved") {
            const cursorMove = await getCursorMove(nvim, buffer, props);
            debouncedWsSend({ root, cursorMove, entry });
            return;
        }
    };
}
