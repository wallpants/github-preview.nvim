import { ENV, PluginInitSchema, type PluginInit } from "@gp/shared";
import { attach, type LogLevel } from "bunvim";
import opener from "opener";
import { parse } from "valibot";
import { subscribeContentChange } from "./subscribe-content-change.ts";
import { subscribeCursorMove } from "./subscribe-cursor-move.ts";
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

await subscribeCursorMove(nvim, async (cursorMove) => {
    const message = await updateBrowserState(
        browserState,
        cursorMove.abs_path,
        cursorMove.cursor_line,
    );
    nvim.logger?.verbose("subscribeCursorMove WS_SERVER_MESSAGE", {
        serverMessage: message,
        browserState,
    });
    webServer.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
});

subscribeContentChange(nvim, browserState, async (newContent, newPath, newCursorLine) => {
    const message = await updateBrowserState(browserState, newPath, newCursorLine, newContent);
    nvim.logger?.verbose("subscribeContentChange WS_SERVER_MESSAGE", {
        serverMessage: message,
        browserState,
    });
    webServer.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
});
