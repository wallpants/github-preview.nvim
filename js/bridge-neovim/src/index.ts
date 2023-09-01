import { attach } from "neovim";
import ipc from "node-ipc";
import { parse } from "valibot";
import winston from "winston";
import { IPC_CLIENT_ID, IPC_EVENT, IPC_SERVER_ID } from "../../consts";
import { ENV } from "../../env";
import { createLogger } from "../../logger";
import {
    PluginPropsSchema,
    RPCNotificationArgSchema,
    type NvimCursorMove,
    type RPCNotificationArg,
} from "./types";

ipc.config.id = IPC_CLIENT_ID;
ipc.config.retry = 1000;

export const EDITOR_EVENTS = [
    "markdown-preview-content-change",
    "markdown-preview-cursor-move",
] as const;

const logger = createLogger(winston, ENV.BRIDGE_LOG_STREAM, ENV.LOG_LEVEL);

async function main() {
    if (!ENV.NVIM) throw Error("missing socket");
    const nvim = attach({ socket: ENV.NVIM });
    const props = parse(PluginPropsSchema, await nvim.getVar("markdown_preview_props"));
    logger.info("connected with props: ", { props });

    ipc.connectTo(IPC_SERVER_ID, () => {
        ipc.of[IPC_SERVER_ID]?.on("connect", async () => {
            for (const event of EDITOR_EVENTS) await nvim.subscribe(event);

            nvim.on(
                "notification",
                (
                    event: (typeof EDITOR_EVENTS)[number],
                    [arg, arg2]: [RPCNotificationArg, NvimCursorMove?],
                ) => {
                    if (ENV.IS_DEV) parse(RPCNotificationArgSchema, arg);

                    logger.info("notification event: ", { event });
                    logger.info("notification arg: ", { arg });
                    logger.info("notification arg2: ", { arg2 });

                    if (event === "markdown-preview-cursor-move") {
                        if (!arg2) throw Error("missing cursor data in notification");
                        ipc.of[IPC_SERVER_ID]?.emit(IPC_EVENT.CURSOR_MOVE, {
                            id: ipc.config.id,
                            arg2,
                        });
                    }

                    // const arg = args[0];
                    // if (!arg) return;
                    // for (const ignorePattern of props.ignore_buffer_patterns) {
                    //     // we use this to avoid updating browser when opening
                    //     // buffers for NvimTree, telescope, and such
                    //     if (minimatch(arg.file, ignorePattern, { matchBase: true })) return;
                    // }

                    // if (event === "markdown-preview-content-change") {
                    //     const buffers = await nvim.buffers;
                    //     const buffer = buffers.find((b) => b.id === arg.buf);
                    //     if (!buffer) throw Error("buffer not found");
                    //     // const text = (await buffer.lines).join("\n");
                    //     ipc.of[IPC_SERVER_ID]?.emit(IPC_EVENT.HELLO, {
                    //         id: ipc.config.id,
                    //         message: `NVIM: ${ENV.NVIM}`,
                    //     });
                    // }
                    // },
                    // );
                    // });
                    // ipc.of[IPC_SERVER_ID]?.on("connect", async () => {
                    // ipc.of[IPC_SERVER_ID]?.on("disconnect", function () {
                    //     ipc.log("disconnected from world");
                    // });
                    // ipc.of[IPC_SERVER_ID]?.on(IPC_EVENT.HELLO, function (data) {
                    //     ipc.log("got a message from world : ", data);
                    // });
                },
            );
        });
    });
}

void main();
