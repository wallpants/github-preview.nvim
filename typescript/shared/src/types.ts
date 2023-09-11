import { type Output } from "valibot";
import type { ContentChangeSchema, CursorMoveSchema, PluginInitSchema } from "./schemas";

export type PluginInit = Output<typeof PluginInitSchema>;
export type CursorMove = Output<typeof CursorMoveSchema>;
export type ContentChange = Output<typeof ContentChangeSchema>;

export type SocketEvent =
    | {
          type: "init";
          data: PluginInit;
      }
    | {
          type: "cursor-move";
          data: CursorMove;
      }
    | {
          type: "content-change";
          data: ContentChange;
      };

export type BrowserState = {
    root: string;
    repoName: string;
    entries: string[];
    currentPath: string;
    content: null | string;
    disableSyncScroll: boolean;
};

export type WsServerMessage = Partial<BrowserState> & {
    repoName?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
};

export type WsBrowserRequest =
    | {
          type: "init";
      }
    | {
          type: "getEntry";
          currentPath: string;
      };
