import { ENV, PluginInitSchema, type PluginInit, type WsServerMessage } from "@gp/shared";
import { attach, type LogLevel } from "bunvim";
import opener from "opener";
import { parse } from "valibot";
import { onBufEnter } from "./on-buf-enter.ts";
import { onContentChange } from "./on-content-change.ts";
import { onCursorHold } from "./on-cursor-hold.ts";
import { type ApiInfo } from "./types.ts";
import { initBrowserState, updateBrowserState } from "./utils.ts";
import { EDITOR_EVENTS_TOPIC, startWebServer } from "./web-server/index.ts";

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket missing");

const LOG_LEVEL = ENV.GP_LOG_LEVEL as LogLevel | undefined;

const nvim = await attach<ApiInfo>({
    socket: SOCKET,
    client: { name: "github-preview" },
    logging: { level: LOG_LEVEL },
});

const init = (await nvim.call("nvim_get_var", ["github_preview_init"])) as PluginInit;
if (ENV.IS_DEV) parse(PluginInitSchema, init);

const browserState = await initBrowserState(init);

const webServer = startWebServer(init.port, browserState, nvim);
if (!ENV.IS_DEV) opener(`http://localhost:${init.port}`);

function wsSend(wsMessage: WsServerMessage) {
    nvim.logger?.verbose("OUTGOING WEBSOCKET", { wsMessage });
    webServer.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(wsMessage));
}

let attachedBuffer: null | number = null;

// Buffer may have been implicitly detached
// https://neovim.io/doc/user/api.html#nvim_buf_detach_event
nvim.onNotification("nvim_buf_detach_event", ([buffer]) => {
    if (attachedBuffer === buffer) attachedBuffer = null;
});

await onBufEnter(nvim, async ([buffer, path, cursorLine]) => {
    nvim.logger?.verbose("onBufEnter", { buffer, path, cursorLine });
    const content =
        path === browserState.currentPath
            ? browserState.content
            : await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
    const message = await updateBrowserState(browserState, path, cursorLine, content);

    wsSend(message);

    if (![buffer, null].includes(attachedBuffer)) {
        await nvim.call("nvim_buf_detach", [buffer]);
        attachedBuffer = null;
    }

    // attach to buffer to receive content change notifications
    const attached = await nvim.call("nvim_buf_attach", [buffer, false, {}]);
    if (attached) attachedBuffer = buffer;
});

onContentChange(nvim, browserState, async (content, path) => {
    nvim.logger?.verbose("onContentChange", { content, path });
    const message = await updateBrowserState(browserState, path, browserState.cursorLine, content);
    wsSend(message);
});

await onCursorHold(nvim, async ([buffer, path, cursorLine]) => {
    nvim.logger?.verbose("onCursorHold", { buffer, path, cursorLine });
    const content =
        path === browserState.currentPath
            ? browserState.content
            : await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
    const message = await updateBrowserState(browserState, path, cursorLine, content);
    wsSend(message);
});
