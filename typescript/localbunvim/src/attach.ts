import { type Socket } from "bun";
import { pack, unpack } from "msgpackr";
import { EventEmitter } from "stream";
import { MessageType, type RPCMessage } from "./types";

const requestQueue: RPCMessage[] = [];

function parse(data: Buffer): RPCMessage {
    return unpack(data) as RPCMessage;
}

export async function attach({ socket }: { socket: string }) {
    const emitter = new EventEmitter();
    let awaitingResponse = false;
    let lastReqId = 0;

    function processRequestQueue(socket: Socket) {
        if (!requestQueue.length || awaitingResponse) return;
        awaitingResponse = true;
        socket.write(pack(requestQueue.shift()));
    }

    const nvimSocket = await Bun.connect({
        unix: socket,
        socket: {
            data(socket, data) {
                const [type, id, ...rest] = parse(data);
                if (type === MessageType.RESPONSE) {
                    emitter.emit(`response-${id}`, rest);
                    awaitingResponse = false;
                }

                if (type === MessageType.NOTIFY) {
                    emitter.emit("notification", { id, rest });
                }

                if (requestQueue.length) {
                    processRequestQueue(socket);
                }
            },
        },
    });

    function request(method: string, ...args: unknown[]) {
        const reqId = ++lastReqId;
        const request: RPCMessage = [MessageType.REQUEST, reqId, method, args];
        requestQueue.push(request);
        processRequestQueue(nvimSocket);
        return new Promise((resolve) => {
            emitter.once(`response-${reqId}`, (args) => {
                resolve(args);
            });
        });
    }

    return {
        request,
    };
}
