import {
    createLogger,
    ENV,
    GP_UNIX_SOCKET_PATH,
    type PluginInit,
    type SocketEvent,
} from "@gp/shared";
import { type Socket } from "bun";
import { attach, type NeovimApiInfo } from "bunvim";
import { normalize } from "node:path";

const logger = createLogger(ENV.GP_BRIDGE_LOG_STREAM);

const EVENT_NAMES: SocketEvent["type"][] = [
    "github-preview-init",
    "github-preview-cursor-move",
    "github-preview-content-change",
];

function initializeServer() {
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
}

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket missing");

const nvim = await attach<NeovimApiInfo>({ socket: SOCKET });
const init = (await nvim.call("nvim_get_var", ["github_preview_init"])) as PluginInit;

const MAX_ATTEMPTS = 20;
let attempt = 1;
let serverInitialized = false;
let client: Socket | undefined;

while (attempt <= MAX_ATTEMPTS && (!client || ["closing", "closed"].includes(client.readyState))) {
    try {
        /* Attempt to connect to server.
         * The server may be either uninitialized OR
         * initialized by a previous lauch of github-preview
         */
        logger.verbose(`attempting to connect # ${attempt++}/${MAX_ATTEMPTS}`);
        client = await Bun.connect({
            unix: GP_UNIX_SOCKET_PATH,
            socket: {
                async open(socket) {
                    // as soon as we connect, we send config to server
                    const initEvent: SocketEvent = {
                        type: "github-preview-init",
                        data: init,
                    };
                    socket.write(JSON.stringify(initEvent));

                    for (const event of EVENT_NAMES) await nvim.call("nvim_subscribe", [event]);

                    /* nvim notifications are forwarded as they are.
                     * It so happens that nvim notification names match
                     * the server's notification names and payload structure
                     */
                    nvim.onNotification((event, args) => {
                        console.log("event: ", event);
                        console.log("args: ", args);
                    });
                    // nvim.on("notification", (event: string, [arg]: unknown[]) => {
                    //     socket.write(JSON.stringify({ type: event, data: arg }));
                    // });
                },
            },
        });
        serverInitialized = true;
    } catch (err) {
        logger.verbose("failed to connect");
        if (!serverInitialized) {
            logger.verbose("starting server");
            initializeServer();
            serverInitialized = true;
        }
        await Bun.sleep(100);
    }
}
