import {
    ENV,
    GP_UNIX_SOCKET_PATH,
    createLogger,
    type PluginInit,
    type SocketEvent,
} from "@gp/shared";
import { type Socket } from "bun";
import { attach } from "neovim";
import { normalize } from "node:path";

const logger = createLogger(ENV.GP_BRIDGE_LOG_STREAM);

const EVENT_NAMES: SocketEvent["type"][] = [
    "github-preview-init",
    "github-preview-cursor-move",
    "github-preview-content-change",
];

if (!ENV.NVIM) {
    logger.error("missing NVIM socket");
    throw Error("missing NVIM socket");
}

if (ENV.IS_DEV) {
    Bun.spawn(["bun", "dev"], {
        cwd: normalize(`${import.meta.dir}/../../server`),
        stdio: [null, null, null],
    });
} else {
    Bun.spawn(["bun", "start"], {
        cwd: normalize(`${import.meta.dir}/../../server`),
        stdio: [null, null, null],
    });
}

const nvim = attach({ socket: ENV.NVIM });
const init = (await nvim.getVar("github_preview_init")) as PluginInit;

let client: Socket | undefined;

const MAX_ATTEMPTS = 20;
let attempt = 0;

while (attempt < MAX_ATTEMPTS && (!client || ["closing", "closed"].includes(client.readyState))) {
    try {
        logger.verbose(`attempting to connect # ${attempt++}/${MAX_ATTEMPTS}`);
        client = await Bun.connect({
            unix: GP_UNIX_SOCKET_PATH,
            socket: {
                async open(socket) {
                    // as soon as we connect, we send config to server
                    const initEvent: SocketEvent = { type: "github-preview-init", data: init };
                    socket.write(JSON.stringify(initEvent));

                    for (const event of EVENT_NAMES) await nvim.subscribe(event);

                    // nvim notifications are forwarded as they are.
                    // It so happens that nvim notification names match
                    // the server's notification names and payload structure
                    nvim.on("notification", (event: string, [arg]: unknown[]) => {
                        socket.write(JSON.stringify({ type: event, data: arg }));
                    });
                },
                data(_socket, data) {
                    logger.verbose("data: ", data);
                },
                connectError(_socket, _error) {
                    logger.verbose("connection failed, maybe retry?");
                },
            },
        });
    } catch (err) {
        logger.verbose("failed to connect");
        await Bun.sleep(100);
    }
}
