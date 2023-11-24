import { createContext, type MutableRefObject } from "react";
import type ReconnectingWebSocket from "reconnecting-websocket";
import { type GithubPreview } from "../../../github-preview.ts";
import { type WsBrowserMessage, type WsServerMessage } from "../../../types.ts";

export type RefObject = {
    urlMasks: Map<string, HTMLElement | null>;
    currentEntries: string[] | undefined;
    ws: ReconnectingWebSocket;
    skipScroll: boolean;
    hash: {
        value: string | undefined;
        lineStart: number | undefined;
        lineEnd: number | undefined;
    };
};

export type MessageHandler = (message: WsServerMessage) => void | Promise<void>;

export type WebsocketContext = {
    registerHandler: (id: string, cb: MessageHandler) => void;
    wsRequest: (m: WsBrowserMessage) => void;
    currentPath: string | null;
    repoName: string | null;
    config: GithubPreview["config"] | null;
    refObject: MutableRefObject<RefObject>;
};

export const websocketContext = createContext<WebsocketContext>({
    registerHandler: () => null,
    wsRequest: () => null,
    currentPath: null,
    repoName: null,
    config: null,
    refObject: { current: {} as RefObject },
});
