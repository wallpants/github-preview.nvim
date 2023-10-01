import {
    ENV,
    PluginInitSchema,
    type BrowserState,
    type PluginInit,
    type WsServerMessage,
} from "@gp/shared";
import { attach, type LogLevel } from "bunvim";
import { relative } from "node:path";
import { parse } from "valibot";
import { onContentChange } from "./nvim-events/on-content-change.ts";
import { onCursorMove } from "./nvim-events/on-cursor-move.ts";
import { onVimLeavePre } from "./nvim-events/on-vim-leave-pre.ts";
import { startServer } from "./server/index.ts";
import { EDITOR_EVENTS_TOPIC } from "./server/websocket.ts";
import { type CustomEvents } from "./types.ts";
import { initBrowserState } from "./utils.ts";

if (!ENV.NVIM) throw Error("socket missing");

const nvim = await attach<CustomEvents>({
    socket: ENV.NVIM,
    client: { name: "github-preview" },
    logging: { level: ENV.GP_LOG_LEVEL as LogLevel | undefined },
});

const init = (await nvim.call("nvim_get_var", ["github_preview_init"])) as PluginInit;
if (ENV.IS_DEV) parse(PluginInitSchema, init);

const browserState = await initBrowserState(init);
const webServer = startServer(init.port, browserState, nvim);

function wsSend(message: WsServerMessage) {
    nvim.logger?.verbose({ OUTGOING_WEBSOCKET: message });
    webServer.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}

await onVimLeavePre(nvim, () => {
    wsSend({ goodbye: true });
    // neovim remains blocked unless we return something
    return true;
});

await onCursorMove(
    nvim,
    async ([buffer, path, cursorLine]: CustomEvents["notifications"]["CursorMove"]) => {
        if (!path) return;
        const relativePath = relative(browserState.root, path);
        nvim.logger?.verbose({ ON_CURSOR_MOVE: { buffer, path: relativePath, cursorLine } });

        const stateUpdate: Partial<BrowserState> = {
            cursorLine: cursorLine,
            currentPath: relativePath,
        };

        if (browserState.currentPath !== relativePath) {
            stateUpdate.content = await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        }

        Object.assign(browserState, stateUpdate);
        wsSend(stateUpdate);
    },
);

await onContentChange(nvim, browserState, (content, path) => {
    if (!path) return;
    const relativePath = relative(browserState.root, path);
    nvim.logger?.verbose({ ON_CONTENT_CHANGE: { content, path: relativePath } });

    const stateUpdate: Partial<BrowserState> = {
        content: content,
        currentPath: relativePath,
    };

    Object.assign(browserState, stateUpdate);
    wsSend(stateUpdate);
});
