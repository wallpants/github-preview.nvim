import { type WsServerMessage } from "@gp/shared";
import { createContext } from "react";

export type MessageHandler = (message: WsServerMessage) => void;

export const websocketContext = createContext<{
    isConnected: boolean;
    registerHandler: (id: string, cb: MessageHandler) => void;
    currentPath: string | undefined;
    getEntries: (path: string) => void;
    navigate: (path: string) => void;
    repoName: string;
}>({
    isConnected: false,
    registerHandler: () => null,
    currentPath: undefined,
    getEntries: () => null,
    navigate: () => null,
    repoName: "",
});
