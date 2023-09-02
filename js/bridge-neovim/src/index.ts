import { attach } from "neovim";
import ipc from "node-ipc";
import { spawn } from "node:child_process";
import { normalize } from "node:path";
import winston from "winston";
import { ENV } from "../../env";
import { createLogger } from "../../logger";
import { IPC_CLIENT_ID, IPC_EVENTS, IPC_SERVER_ID } from "../../server/src/consts";
// import type { ContentChange } from "../../server/src/types";

const logger = createLogger(winston, ENV.BRIDGE_LOG_STREAM, ENV.LOG_LEVEL);

ipc.config.id = IPC_CLIENT_ID;
ipc.config.logger = (log) => logger.verbose("IPC LOG", log);

const updateConfigEvent: (typeof IPC_EVENTS)[number] = "github-preview-update-config";
// const contentChangeEvent: (typeof IPC_EVENTS)[number] = "github-preview-content-change";

async function main() {
    if (!ENV.NVIM) {
        logger.error("missing NVIM socket");
        return;
    }

    // Spawn server. Some connection attempts might happen before the server boots up
    const serverPath = `${__dirname}/../../server/src/index.ts`;
    spawn("tsx", ["watch", normalize(serverPath)]);

    const nvim = attach({ socket: ENV.NVIM });
    const config = await nvim.getVar("github_preview_config");

    ipc.connectTo(IPC_SERVER_ID, () => {
        const socket = ipc.of[IPC_SERVER_ID];
        if (!socket) {
            logger.error("missing ipc socket");
            return;
        }

        socket.on("connect", async () => {
            socket.emit(updateConfigEvent, config);

            // get initial content to populate webapp
            // const buffer = await nvim.buffer;
            // const contentChange: ContentChange = {
            //     abs_file_path: await buffer.name,
            //     content: (await buffer.lines).join("\n"),
            // };
            // ipc.of[IPC_SERVER_ID]?.emit(contentChangeEvent, contentChange);

            for (const event of IPC_EVENTS) await nvim.subscribe(event);
            // Here we forward nvim notifications. It so happens
            // that nvim notification names match the server's
            // and so does the notification payload type
            nvim.on("notification", (event: string, args: unknown[]) => {
                socket.emit(event, args[0]);
            });
        });
    });
}

main().catch((err) => logger.error("BOUNDARY ERROR: ", err));
