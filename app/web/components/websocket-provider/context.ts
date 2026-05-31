import { createContext, type RefObject } from "react";
import type ReconnectingWebSocket from "reconnecting-websocket";
import {
   type GithubPreviewConfig,
   type WsBrowserMessage,
   type WsServerMessage,
} from "../../../types.ts";

export type RefData = {
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
   config: GithubPreviewConfig | null;
   refObject: RefObject<RefData>;
};

export const websocketContext = createContext<WebsocketContext>({
   registerHandler: () => null,
   wsRequest: () => null,
   currentPath: null,
   repoName: null,
   config: null,
   refObject: { current: {} as RefData },
});
