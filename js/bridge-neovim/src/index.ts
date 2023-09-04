import { attach } from "neovim";
import ipc from "node-ipc";
import { spawn } from "node:child_process";
import { normalize } from "node:path";
import winston from "winston";
import { ENV } from "../../env";
import { createLogger } from "../../logger";
import { IPC_CLIENT_ID, IPC_EVENTS, IPC_SERVER_ID } from "../../server/src/consts";

const logger = createLogger(winston, ENV.BRIDGE_LOG_STREAM, ENV.LOG_LEVEL);

ipc.config.id = IPC_CLIENT_ID;
ipc.config.logger = (log) => logger.debug(log);

const initEvent: (typeof IPC_EVENTS)[number] = "github-preview-init";

async function main() {
    if (!ENV.NVIM) {
        logger.error("missing NVIM socket");
        return;
    }

    // Spawn server
    // Some connection attempts might happen before the server boots up
    if (ENV.GP_IS_DEV) spawn("tsx", ["watch", normalize(`${__dirname}/../../server/src/index.ts`)]);
    else spawn("node", [normalize(`${__dirname}/../../server/dist/index.js`)]);

    const nvim = attach({ socket: ENV.NVIM });
    const init = await nvim.getVar("github_preview_init");

    ipc.connectTo(IPC_SERVER_ID, () => {
        const socket = ipc.of[IPC_SERVER_ID];
        if (!socket) {
            logger.error("missing ipc socket");
            return;
        }

        socket.on("connect", () => {
            // as soon as we connect, we send config to server
            socket.emit(initEvent, init);

            for (const event of IPC_EVENTS)
                nvim.subscribe(event).catch((e) => logger.error("nvim.subscribe ERROR", e));
            // nvim notifications are forwarded as they are.
            // It so happens that nvim notification names match
            // the server's notification names and payload structure
            nvim.on("notification", (event: string, args: unknown[]) => {
                socket.emit(event, args[0]);
            });
        });
    });
}

main().catch((err) => logger.error("BOUNDARY ERROR", err));
