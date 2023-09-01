import { minimatch } from "minimatch";
import { attach } from "neovim";
import ipc from "node-ipc";
import { parse } from "valibot";
import { IPC_CLIENT_ID, IPC_EVENT, IPC_SERVER_ID } from "../../consts";
import { ENV } from "../../env";
import { PluginPropsSchema, type NeovimNotificationArg } from "./types";

ipc.config.id = IPC_CLIENT_ID;
const socket = ENV.NVIM_LISTEN_ADDRESS ?? process.argv[2];

export const EDITOR_EVENTS = [
    "markdown-preview-content-change",
    "markdown-preview-cursor-update",
] as const;

async function main() {
    if (!socket) throw Error("missing socket");
    const nvim = attach({ socket });
    const props = parse(PluginPropsSchema, await nvim.getVar("markdown_preview_props"));

    ipc.connectTo(IPC_SERVER_ID, function () {
        ipc.of[IPC_SERVER_ID]?.on("connect", async () => {
            for (const event of EDITOR_EVENTS) await nvim.subscribe(event);
            nvim.on(
                "notification",
                async (event: (typeof EDITOR_EVENTS)[number], [arg]: NeovimNotificationArg[]) => {
                    if (!arg) return;
                    for (const ignorePattern of props.ignore_buffer_patterns) {
                        // we use this to avoid updating browser when opening
                        // buffers for NvimTree, telescope, and such
                        if (minimatch(arg.file, ignorePattern, { matchBase: true })) return;
                    }

                    if (event === "markdown-preview-content-change") {
                        const buffers = await nvim.buffers;
                        const buffer = buffers.find((b) => b.id === arg.buf);
                        if (!buffer) throw Error("buffer not found");
                        const text = (await buffer.lines).join("\n");
                        ipc.of[IPC_SERVER_ID]?.emit(IPC_EVENT.HELLO, {
                            id: ipc.config.id,
                            message: text,
                        });
                    }
                },
            );
        });
        // ipc.of[IPC_SERVER_ID]?.emit(IPC_EVENT.HELLO, {
        //     id: ipc.config.id,
        //     message: "hello",
        // });
        // ipc.of[IPC_SERVER_ID]?.on("disconnect", function () {
        //     ipc.log("disconnected from world");
        // });
        // ipc.of[IPC_SERVER_ID]?.on(IPC_EVENT.HELLO, function (data) {
        //     ipc.log("got a message from world : ", data);
        // });
    });
}

void main();
