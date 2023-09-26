import { type WsServerMessage } from "@gp/shared";
import { createContext } from "react";

export type MessageHandler = (message: WsServerMessage) => void;

export const websocketContext = createContext<{
    isConnected: boolean;
    registerHandler: (id: string, cb: MessageHandler) => void;
    currentPath: string | undefined;
    setCurrentPath: (path: string) => void;
    getEntries: (path: string) => void;
}>({
    isConnected: false,
    registerHandler: () => null,
    currentPath: undefined,
    setCurrentPath: () => null,
    getEntries: () => null,
});
