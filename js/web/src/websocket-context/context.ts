import { createContext } from "react";
import { type BrowserState } from "../../../server/src/types";
import { type WsServerMessage } from "../types";

export type Status = "offline" | "online" | "reconnecting";
export type MessageHandler = (
    message: WsServerMessage,
    fileName: string | undefined,
    syncScrollEnabled: boolean | undefined,
) => void;
export type AddMessageHandler = (key: string, handler: MessageHandler) => void;

export const websocketContext = createContext<
    Partial<Omit<BrowserState, "content">> & {
        status: Status;
        navigate: (path: string) => void;
        addMessageHandler: AddMessageHandler;
    }
>({
    status: "online",
    navigate: () => null,
    addMessageHandler: () => null,
});
