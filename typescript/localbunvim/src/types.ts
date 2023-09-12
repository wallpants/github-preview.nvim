export enum MessageType {
    REQUEST = 0,
    RESPONSE = 1,
    NOTIFY = 2,
}

export type RPCMessage =
    | [MessageType.REQUEST, id: number, method: string, args: unknown[]]
    | [MessageType.RESPONSE, id: number, error: Error | null, response: unknown[]]
    | [MessageType.NOTIFY, id: number, val1: unknown, val2: unknown];
