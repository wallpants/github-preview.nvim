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
    const messageOutQueue: RPCMessage[] = [];
    const emitter = new EventEmitter({ captureRejections: true });

    let notificationsHandler: OnNotificationCallback | undefined;
    let awaitingResponse = false;
    let lastReqId = 0;

    function processRequestQueue(socket: Socket) {
        if (!messageOutQueue.length || awaitingResponse) return;
        awaitingResponse = true;
        socket.write(pack(messageOutQueue.shift()));
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
                    const [error, response] = args;
                    emitter.emit(`response-${id}`, error, response);
                    awaitingResponse = false;
                }

                if (messageOutQueue.length) {
                    processRequestQueue(socket);
                }
            },
        },
    });

    function call(method: string, ...args: unknown[]) {
        const reqId = ++lastReqId;
        const request: RPCMessage = [MessageType.REQUEST, reqId, method, args];
        return new Promise((resolve, reject) => {
            emitter.once(`response-${reqId}`, (error, response) => {
                if (error) reject(error);
                resolve(response);
            });
            messageOutQueue.push(request);
            processRequestQueue(nvimSocket);
        });
    }

    function onNotification(callback: OnNotificationCallback) {
        notificationsHandler = callback;
    }

    return { call, onNotification };
}
