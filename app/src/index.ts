import { attach, type LogLevel } from "bunvim";
import { relative } from "node:path";
import { parse } from "valibot";
import { ENV } from "./env.ts";
import { onBeforeExit } from "./nvim-events/on-before-exit.ts";
import { onContentChange } from "./nvim-events/on-content-change.ts";
import { onCursorMove } from "./nvim-events/on-cursor-move.ts";
import { PluginInitSchema } from "./schemas.ts";
import { unaliveURL } from "./server/http.tsx";
import { startServer } from "./server/index.ts";
import { EDITOR_EVENTS_TOPIC } from "./server/websocket.ts";
import {
    type BrowserState,
    type CustomEvents,
    type PluginInit,
    type WsServerMessage,
} from "./types.ts";
import { initBrowserState } from "./utils.ts";

const HOST = "localhost";

if (!ENV.NVIM) throw Error("socket missing");

const nvim = await attach<CustomEvents>({
    socket: ENV.NVIM,
    client: { name: "github-preview" },
    logging: { level: ENV.GP_LOG_LEVEL as LogLevel | undefined },
});

const init = (await nvim.call("nvim_get_var", ["github_preview_init"])) as PluginInit;
if (ENV.IS_DEV) parse(PluginInitSchema, init);

try {
    await fetch(`http://${HOST}:${init.port}${unaliveURL}`);
    // eslint-disable-next-line
} catch (err) {}

const browserState = await initBrowserState(init);
const webServer = startServer(HOST, init.port, browserState, nvim);

function wsSend(message: WsServerMessage) {
    nvim.logger?.verbose({ OUTGOING_WEBSOCKET: message });
    webServer.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}

const augroupId = await nvim.call("nvim_create_augroup", ["github-preview", { clear: true }]);

await onBeforeExit(nvim, augroupId, async () => {
    wsSend({ goodbye: true });
    await nvim.call("nvim_del_augroup_by_id", [augroupId]);
    // We're handling an RPCRequest, which means neovim remains blocked
    // until we return something
    return true;
});

await onCursorMove(
    nvim,
    augroupId,
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

await onContentChange(nvim, augroupId, browserState, (content, path) => {
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
