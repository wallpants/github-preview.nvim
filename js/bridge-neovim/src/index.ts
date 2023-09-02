import { attach } from "neovim";
import ipc from "node-ipc";
import { spawn } from "node:child_process";
import { normalize } from "node:path";
import { array, boolean, literal, number, object, parse, string, union } from "valibot";
import winston from "winston";
import { ENV } from "../../env";
import { createLogger } from "../../logger";
import { IPC_CLIENT_ID, IPC_EVENTS, IPC_SERVER_ID } from "../../server/src/consts";

ipc.config.id = IPC_CLIENT_ID;

const PluginPropsSchema = object({
    port: number(),
    cwd: string(),
    scroll_debounce_ms: number(),
    disable_sync_scroll: boolean(),
    ignore_buffer_patterns: array(string()),
    sync_scroll_type: union([literal("middle"), literal("top"), literal("relative")]),
});

const logger = createLogger(winston, ENV.BRIDGE_LOG_STREAM, ENV.LOG_LEVEL);

async function main() {
    if (!ENV.NVIM) throw Error("missing socket");

    const nvim = attach({ socket: ENV.NVIM });
    const props = parse(PluginPropsSchema, await nvim.getVar("markdown_preview_props"));
    logger.info("props", props);

    ipc.connectTo(IPC_SERVER_ID, () => {
        ipc.of[IPC_SERVER_ID]?.on("connect", async () => {
            for (const event of IPC_EVENTS) await nvim.subscribe(event);
            nvim.on("notification", (event: string, args: unknown[]) => {
                ipc.of[IPC_SERVER_ID]?.emit(event, args[0]);
            });
        });
    });
}

try {
    const serverPath = `${__dirname}/../../server/src/index.ts`;
    spawn("tsx", ["watch", normalize(serverPath)]);
    void main();
} catch (err) {
    logger.error("error", err);
}
