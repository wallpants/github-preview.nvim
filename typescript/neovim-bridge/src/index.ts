import {
    ENV,
    EVENT_NAMES,
    GP_UNIX_SOCKET_PATH,
    type PluginInit,
    type SocketEvent,
} from "@gp/shared";
import { attach } from "neovim";
import { normalize } from "node:path";

const SOCKET = process.env["NVIM"];

if (!SOCKET) throw Error("missing NVIM socket");

if (!ENV.IS_DEV) {
    Bun.spawn([normalize(`${import.meta.dir}/../../server/bin`)], {
        stdio: [null, null, null],
    });
}

const nvim = attach({ socket: SOCKET });
const init = (await nvim.getVar("github_preview_init")) as PluginInit;

await Bun.connect({
    unix: GP_UNIX_SOCKET_PATH,
    socket: {
        async open(socket) {
            // as soon as we connect, we send config to server
            const initEvent: SocketEvent = { type: "init", data: init };
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
            console.log("data: ", data);
        },
        connectError(_socket, _error) {
            console.log("connection failed, maybe retry?");
        },
    },
});
