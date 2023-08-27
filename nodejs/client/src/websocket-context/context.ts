import { createContext } from "react";
import { type WsServerMessage } from "../../../types";

export type Status = "online" | "reconnecting";
export type MessageHandler = (message: WsServerMessage) => void | Promise<void>;
export type AddMessageHandler = (key: string, handler: MessageHandler) => void;

export const websocketContext = createContext<{
    addMessageHandler: AddMessageHandler;
    status: Status;
}>({ addMessageHandler: () => null, status: "online" });
