import { type Socket } from "bun";
import { pack, unpack } from "msgpackr";
import { EventEmitter } from "node:events";

enum MessageType {
    REQUEST = 0,
    RESPONSE = 1,
    NOTIFY = 2,
}

type OnNotificationCallback = (eventName: string, args: unknown) => void | Promise<void>;

type RPCMessage =
    | [MessageType.REQUEST, id: number, method: string, args: unknown[]]
    | [MessageType.RESPONSE, id: number, error: Error | null, response: unknown[]]
    | [MessageType.NOTIFY, eventName: string, args: unknown[]];

export async function attach({ socket }: { socket: string }) {
    const requestQueue: RPCMessage[] = [];
    const emitter = new EventEmitter({ captureRejections: true });

    let notificationsHandler: OnNotificationCallback | undefined;
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
            async data(socket, data) {
                const [type, id, ...args] = unpack(data) as RPCMessage;
                if (type === MessageType.NOTIFY) {
                    await notificationsHandler?.(id, args);
                }

                if (type === MessageType.RESPONSE) {
                    emitter.emit(`response-${id}`, args);
                    awaitingResponse = false;
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

    function onNotification(callback: OnNotificationCallback) {
        notificationsHandler = callback;
    }

    return { request, onNotification };
}
