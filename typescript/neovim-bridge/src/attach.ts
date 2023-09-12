import { type Socket } from "bun";
import { ENV } from "gpshared";
import { encode, unpack } from "msgpackr";
import { type NvimSocketMetadata } from ".";

enum RequestType {
    REQUEST = 0,
    RESPONSE = 1,
    NOTIFY = 2,
}

type RPCRequest = [RequestType, id: number, method: string, args: string[]];

let incId = 0;
const requestQueue: RPCRequest[] = [
    [RequestType.REQUEST, incId++, "nvim_get_var", ["github_preview_init"]],
];

function rpcRequests(nvimSocket: Socket<NvimSocketMetadata>) {
    if (requestQueue.length) nvimSocket.write(encode(requestQueue[0]));
}

export async function attach() {
    if (!ENV.NVIM) throw Error("ENV.NVIM missing");

    const nvimRPC = await Bun.connect<NvimSocketMetadata>({
        unix: ENV.NVIM,
        socket: {
            open(nvimSocket) {
                request(nvimSocket);
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
}
