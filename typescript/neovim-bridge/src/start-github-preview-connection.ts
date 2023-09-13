import {
    ENV,
    GP_UNIX_SOCKET_PATH,
    createLogger,
    type PluginInit,
    type SocketEvent,
} from "@gp/shared";
import { type Socket } from "bun";
import { normalize } from "node:path";

const logger = createLogger(ENV.GP_BRIDGE_LOG_STREAM);

// if (!ENV.NVIM) {
//     logger.error("missing NVIM socket");
//     throw Error("missing NVIM socket");
// }

// const nvim = attach({ socket: ENV.NVIM });
// const init = (await nvim.getVar("github_preview_init")) as PluginInit;

let client: Socket | undefined;

const MAX_ATTEMPTS = 20;
let attempt = 1;
let serverInitialized = false;

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

type NvimSocketMetadata =
    | {
          init: PluginInit;
          githubPreviewConn?: Socket;
      }
    | undefined;

export async function startGithubPreviewConnection(nvimSocket: Socket<NvimSocketMetadata>) {
    const init = nvimSocket.data?.init;
    if (!init) throw Error("PluginInit missing");

    while (
        attempt <= MAX_ATTEMPTS &&
        (!client || ["closing", "closed"].includes(client.readyState))
    ) {
        try {
            /* Attempt to connect to server.
             * The server may be either uninitialized OR
             * initialized by a previous lauch of github-preview
             */
            logger.verbose(`attempting to connect # ${attempt++}/${MAX_ATTEMPTS}`);
            client = await Bun.connect({
                unix: GP_UNIX_SOCKET_PATH,
                socket: {
                    open(socket) {
                        // as soon as we connect, we send config to server
                        const initEvent: SocketEvent = {
                            type: "github-preview-init",
                            data: init,
                        };
                        socket.write(JSON.stringify(initEvent));

                        // for (const event of EVENT_NAMES) await nvim.subscribe(event);

                        /* nvim notifications are forwarded as they are.
                         * It so happens that nvim notification names match
                         * the server's notification names and payload structure
                         */
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

    return client;
}
