import { createContext } from "react";
import { type GithubPreview } from "../../../github-preview.ts";
import { type WsBrowserMessage, type WsServerMessage } from "../../../types.ts";

export type MessageHandler = (message: WsServerMessage) => void | Promise<void>;

export type WebsocketContext = {
    isConnected: boolean;
    registerHandler: (id: string, cb: MessageHandler) => void;
    currentPath: string | undefined;
    currentEntries: string[] | undefined;
    hash: string | null | undefined;
    setHash: (h: string | null | undefined) => void;
    repoName: string;
    wsRequest: (m: WsBrowserMessage) => void;
    config: GithubPreview["config"] | undefined;
};

export const websocketContext = createContext<WebsocketContext>({
    isConnected: false,
    registerHandler: () => null,
    currentPath: undefined,
    currentEntries: undefined,
    hash: null,
    setHash: () => null,
    repoName: "",
    wsRequest: () => null,
    config: undefined,
});
