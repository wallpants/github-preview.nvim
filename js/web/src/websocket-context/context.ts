import { createContext } from "react";
import { type BrowserState } from "../../../server/src/types";
import { type WsServerMessage } from "../types";

export type Status = "offline" | "online" | "reconnecting";
export type MessageHandler = (message: WsServerMessage) => void;

export const websocketContext = createContext<
    Partial<Omit<BrowserState, "content">> & {
        status: Status;
        navigate: (path: string) => void;
    }
>({
    status: "online",
    navigate: () => null,
});
