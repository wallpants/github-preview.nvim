import { type Socket } from "bun";
import { ENV, type PluginInit, type SocketEvent } from "gpshared";
import { pack, unpack } from "msgpackr";

if (!ENV.NVIM) {
    throw Error("missing NVIM socket");
}

const EVENT_NAMES: SocketEvent["type"][] = [
    "github-preview-init",
    "github-preview-cursor-move",
    "github-preview-content-change",
];

let msgId = 0;

const call: [type: RequestType, msgId: number, command: string, args: string[]][] = [
    [RequestType.REQUEST, msgId++, "nvim_get_var", ["github_preview_init"]],
];

export type NvimSocketMetadata =
    | {
          init: PluginInit;
          githubPreviewConn?: Socket;
      }
    | undefined;

await Bun.connect<NvimSocketMetadata>({
    unix: ENV.NVIM,
    socket: {
        open(nvimSocket) {
            nvimSocket.write(
                pack([RequestType.REQUEST, msgId++, "nvim_get_var", ["github_preview_init"]]),
            );
        },
        data(_nvimSocket, data) {
            console.log("data received: ", data);
            const message = unpack(data) as [
                type: RequestType,
                resId: number,
                error: Error | null,
                result: unknown,
            ];
            console.log("message: ", message);
            // const [, resId, , result] = message;

            // if (resId === 0) {
            //     nvimSocket.data = { init: result as PluginInit };

            //     const githubPreviewConn = await startGithubPreviewConnection(nvimSocket);
            //     if (!githubPreviewConn) throw Error("unixClient missing");

            //     nvimSocket.data.githubPreviewConn = githubPreviewConn;

            //     EVENT_NAMES.forEach((event) => {
            //         nvimSocket.write(
            //             pack([RequestType.REQUEST, msgId++, "nvim_subscribe", [event]]),
            //         );
            //     });
            //     return;
            // }
        },
        error(_socket, error) {
            console.log("error: ", error);
        },
        close(_socket) {
            console.log("connection closed");
        },
        end(_socket) {
            console.log("connection closed by nvim");
        },
        handshake(_socket, success, authorizationError) {
            console.log("handshake success: ", success);
            console.log("handshake authorizationError: ", authorizationError);
        },
        connectError(_socket, error) {
            console.log("connectError: ", error);
        },
    },
});
