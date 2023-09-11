import { type BrowserState, type WsServerMessage } from "@gp/shared";
import { createContext, createRef, type RefObject } from "react";
import { type Offsets } from "../components/markdown/markdown-it/scroll";

export type MessageHandler = (message: WsServerMessage) => void;

export const websocketContext = createContext<{
    isConnected: boolean;
    navigate: (path: string) => void;
    state: RefObject<Partial<BrowserState>>;
    offsets: RefObject<Offsets>;
    tick: boolean;
}>({
    isConnected: false,
    navigate: () => null,
    state: createRef(),
    offsets: createRef(),
    tick: false,
});
