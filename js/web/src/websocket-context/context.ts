import { createContext, createRef, type RefObject } from "react";
import { type BrowserState } from "../../../server/src/types";
import { type WsServerMessage } from "../types";

export type MessageHandler = (message: WsServerMessage) => void;

export const websocketContext = createContext<{
    isConnected: boolean;
    navigate: (path: string) => void;
    state: RefObject<Partial<BrowserState>>;
    tick: boolean;
}>({
    isConnected: false,
    navigate: () => null,
    state: createRef(),
    tick: false,
});
