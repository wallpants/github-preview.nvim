import { createContext } from "react";
import { type WsBrowserMessage, type WsServerMessage } from "../types";

export type Status = "online" | "reconnecting";
export type MessageHandler = (message: WsServerMessage) => void | Promise<void>;
export type AddMessageHandler = (key: string, handler: MessageHandler) => void;

export const websocketContext = createContext<{
    status: Status;
    wsSend: (m: WsBrowserMessage) => void;
    addMessageHandler: AddMessageHandler;
}>({
    status: "online",
    wsSend: () => null,
    addMessageHandler: () => null,
});
