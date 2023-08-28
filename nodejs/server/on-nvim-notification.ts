import { debounce } from "lodash-es";
import { minimatch } from "minimatch";
import { type NeovimClient } from "neovim";
import { type Server } from "node:http";
import { relative } from "node:path";
import {
    type CurrentEntry,
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
    nvim: NeovimClient;
    httpServer: Server;
    root: string;
    props: PluginProps;
    wsSend: (w: WsServerMessage) => void;
};

export function onNvimNotification({
    nvim,
    httpServer,
    root,
    props,
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
        if (!arg.file) return; // arg.file is "" on telescope buffers

        if (event === "markdown-preview-buffer-delete") {
            wsSend({
                root,
                goodbye: true,
                currentEntry: {
                    type: "dir",
                    relativeToRoot: "",
                },
            });
            httpServer.close();
            return;
        }

        for (const ignorePattern of props.ignore_buffer_patterns) {
            // we use this to avoid updating browser when opening
            // buffers for NvimTree and such
            if (minimatch(arg.file, ignorePattern, { matchBase: true })) return;
        }

        const buffers = await nvim.buffers;
        const buffer = buffers.find((b) => b.id === arg.buf);
        if (!buffer) throw Error("buffer not found");
        const markdown = (await buffer.lines).join("\n");

        const currentEntry: CurrentEntry = {
            relativeToRoot: relative(root, arg.file),
            type: "file",
            markdown,
        };

        if (event === "markdown-preview-text-changed") {
            wsSend({ root, currentEntry });
            return;
        }

        if (event === "markdown-preview-cursor-moved") {
            // TODO only send currentEntry if it's different
            // from what the browser has
            const cursorMove = await getCursorMove(nvim, props, markdown);
            debouncedWsSend({ root, cursorMove, currentEntry });
            return;
        }
    };
}
