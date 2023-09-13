import { type Socket } from "bun";
import { pack, unpack } from "msgpackr";
import { EventEmitter } from "node:events";

enum MessageType {
    REQUEST = 0,
    RESPONSE = 1,
    NOTIFY = 2,
}

type NotificationHandler = (event: string, args: unknown) => void | Promise<void>;

type RPCMessage =
    | [MessageType.REQUEST, id: number, method: string, args: unknown[]]
    | [MessageType.RESPONSE, id: number, error: Error | null, response: unknown]
    | [MessageType.NOTIFY, eventName: string, args: unknown];

export async function attach<
    ApiInfo extends Record<string, { parameters: unknown[]; returns: unknown }>,
>({ socket }: { socket: string }) {
    const messageOutQueue: RPCMessage[] = [];
    const emitter = new EventEmitter({ captureRejections: true });

    let notificationHandler: NotificationHandler | undefined;
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
                    await notificationHandler?.(id, args);
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

    function call<M extends keyof ApiInfo>(
        method: M,
        args: ApiInfo[M]["parameters"],
    ): Promise<ApiInfo[M]["returns"]> {
        const reqId = ++lastReqId;
        const request: RPCMessage = [MessageType.REQUEST, reqId, method as string, args];
        return new Promise((resolve, reject) => {
            emitter.once(`response-${reqId}`, (error, response) => {
                if (error) reject(error);
                resolve(response);
            });
            messageOutQueue.push(request);
            processRequestQueue(nvimSocket);
        });
    }

    function onNotification(callback: NotificationHandler) {
        notificationHandler = callback;
    }

    return { call, onNotification };
}
