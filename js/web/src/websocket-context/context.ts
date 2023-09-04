import { createContext } from "react";
import { type WsBrowserRequest, type WsServerMessage } from "../types";

export type Status = "online" | "reconnecting";
export type MessageHandler = (message: WsServerMessage) => void;
export type AddMessageHandler = (key: string, handler: MessageHandler) => void;

export const websocketContext = createContext<{
    status: Status;
    wsRequest: (m: WsBrowserRequest) => void;
    addMessageHandler: AddMessageHandler;
}>({
    status: "online",
    wsRequest: () => null,
    addMessageHandler: () => null,
});
