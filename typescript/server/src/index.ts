import {
    ENV,
    PluginInitSchema,
    type BrowserState,
    type PluginInit,
    type WsServerMessage,
} from "@gp/shared";
import { attach, type LogLevel } from "bunvim";
import { parse } from "valibot";
import { onContentChange } from "./on-content-change.ts";
import { onCursorMove } from "./on-cursor-move.ts";
import { type ApiInfo } from "./types.ts";
import { getEntries, initBrowserState } from "./utils.ts";
import { EDITOR_EVENTS_TOPIC, startWebServer } from "./web-server/index.ts";

if (!ENV.NVIM) throw Error("socket missing");

const nvim = await attach<ApiInfo>({
    socket: ENV.NVIM,
    client: { name: "github-preview" },
    logging: { level: ENV.GP_LOG_LEVEL as LogLevel | undefined },
});

const init = (await nvim.call("nvim_get_var", ["github_preview_init"])) as PluginInit;
if (ENV.IS_DEV) parse(PluginInitSchema, init);

const browserState = await initBrowserState(init);
const webServer = startWebServer(init.port, browserState, nvim);

function wsSend(message: WsServerMessage) {
    nvim.logger?.verbose({ OUTGOING_WEBSOCKET: message });
    webServer.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}

await onCursorMove(nvim, async ([buffer, path, cursorLine]: [number, string, number]) => {
    if (!path) return;
    nvim.logger?.verbose({ ON_CURSOR_MOVE: { buffer, path, cursorLine } });

    const stateUpdate: Partial<BrowserState> = {
        cursorLine: cursorLine,
    };

    if (browserState.currentPath !== path) {
        stateUpdate.currentPath = path;
        stateUpdate.content = await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        stateUpdate.entries = await getEntries({ currentPath: path, root: init.root });
    }

    Object.assign(browserState, stateUpdate);
    wsSend(stateUpdate);
});

await onContentChange(nvim, browserState, async (content, path) => {
    if (!path) return;
    nvim.logger?.verbose({ ON_CONTENT_CHANGE: { content, path } });

    const stateUpdate: Partial<BrowserState> = {
        content: content,
    };

    if (browserState.currentPath !== path) {
        stateUpdate.currentPath = path;
        stateUpdate.entries = await getEntries({ currentPath: path, root: init.root });
    }

    Object.assign(browserState, stateUpdate);
    wsSend(stateUpdate);
});
