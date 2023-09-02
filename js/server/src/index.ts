// import { attach } from "neovim";
// import { createServer } from "node:http";
// import opener from "opener";
// import { parse } from "valibot";
// import { WebSocketServer } from "ws";
// import { onHttpRequest } from "./on-http-request";
// import { RPC_EVENTS } from "./on-nvim-notification";
// import { onWssConnection } from "./on-wss-connection";
// import { findRepoRoot } from "./utils";
import ipc from "node-ipc";
import { type Socket } from "node:net";
import winston from "winston";
import { ENV } from "../../env";
import { createLogger } from "../../logger";
import { IPC_SERVER_ID, type IPC_EVENTS } from "./consts";
import { type CursorMove } from "./types";

const logger = createLogger(winston, ENV.SERVER_LOG_STREAM, ENV.LOG_LEVEL);

ipc.config.id = IPC_SERVER_ID;
ipc.config.retry = 1500;
// ipc.config.maxConnections = 1;

ipc.serve(function () {
    const cursorMove: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";
    ipc.server.on(cursorMove, function (data: CursorMove, _socket: Socket) {
        logger.warn(cursorMove, data);
    });

    const contentChange: (typeof IPC_EVENTS)[number] = "github-preview-content-change";
    ipc.server.on(contentChange, function (data: CursorMove, _socket: Socket) {
        logger.warn(contentChange, data);
    });

    // ipc.server.emit(socket, IPC_EVENT.HELLO, {
    //     id: ipc.config.id,
    //     message: data.message + " world!",
    // });
    // ipc.server.stop();
});

ipc.server.start();

// async function killExisting(port: number) {
//     try {
//         // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
//         // @ts-expect-error fetch is not defined it @types/node
//         await fetch(`http://localhost:${port}`, { method: "POST" }); // eslint-disable-line
//         console.log("innocent server killed");
//     } catch (err) {
//         console.log("no server to kill");
//     }
// }

// async function main() {
//     if (!ENV.NVIM) throw Error("missing socket");
//     const nvim = attach({ socket: ENV.NVIM });

//     const props = parse(PluginPropsSchema, await nvim.getVar("markdown_preview_props"));
//     const PORT = Number(ENV.VITE_GP_PORT ?? props.port);
//     await killExisting(PORT);
//     await nvim.lua('print("starting MarkdownPreview server")');

//     const root = findRepoRoot(props.cwd);
//     // TODO: better logging
//     if (!root) throw Error("root .git directory NOT FOUND");

//     for (const event of RPC_EVENTS) await nvim.subscribe(event);

//     const httpServer = createServer();
//     httpServer.on("request", onHttpRequest({ nvim, httpServer, props }));

//     const wsServer = new WebSocketServer({ server: httpServer });
//     wsServer.on("connection", onWssConnection({ nvim, httpServer, root, props }));

//     !IS_DEV && opener(`http://localhost:${PORT}`);
//     httpServer.listen(PORT, () => {
//         console.log(`Server is listening on port ${PORT}`);
//     });
// }

// main().catch((err) => {
//     console.log(err);
// });
