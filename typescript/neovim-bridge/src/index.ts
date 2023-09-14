import { createLogger, ENV, GP_UNIX_SOCKET_PATH, type PluginInit } from "@gp/shared";
import { type Socket } from "bun";
import { attach } from "bunvim";
import { normalize } from "node:path";

const logger = createLogger(ENV.GP_BRIDGE_LOG_STREAM);

const EVENT_NAMES = [
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

const nvim = await attach<{
    "some-event": [{ name: string; age: number }];
    "some-other-event": [boolean];
}>({ socket: SOCKET });
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
                    const initEvent = {
                        type: "github-preview-init",
                        data: init,
                    };
                    // TODO(gualcasas) use msgpackr instead of JSON.stringify
                    socket.write(JSON.stringify(initEvent));

                    for (const event of EVENT_NAMES) await nvim.call("nvim_subscribe", [event]);

                    /* nvim notifications are forwarded as they are.
                     * It so happens that nvim notification names match
                     * the server's notification names and payload structure
                     */
                    nvim.onNotification((event, [arg]) => {
                        // TODO(gualcasas) use msgpackr instead of JSON.stringify
                        socket.write(JSON.stringify({ type: event, data: arg }));
                        if (event === "some-event") {
                        }
                    });
                },
                data(_socket, data) {
                    logger.verbose("data received", data);
                },
            },
        });
        serverInitialized = true;
    } catch (err) {
        logger.verbose(err);
        if (!serverInitialized) {
            logger.verbose("starting server");
            initializeServer();
            serverInitialized = true;
        }
        await Bun.sleep(100);
    }
}
