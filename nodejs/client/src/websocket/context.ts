import { createContext } from "react";
import { type WsMessage } from "../../../types";

export type Status = "online" | "offline";
export type MessageHandler = (message: WsMessage) => void | Promise<void>;
export type AddMessageHandler = (key: string, handler: MessageHandler) => void;

export const websocketContext = createContext<{
    addMessageHandler: AddMessageHandler;
    status: Status;
}>({ addMessageHandler: () => null, status: "offline" });
