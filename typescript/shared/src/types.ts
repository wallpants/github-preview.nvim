import { type Output } from "valibot";
import type { ContentChangeSchema, CursorMoveSchema, PluginInitSchema } from "./schemas";

export type PluginInit = Output<typeof PluginInitSchema>;
export type CursorMove = Output<typeof CursorMoveSchema>;
export type ContentChange = Output<typeof ContentChangeSchema>;

export type BrowserState = {
    root: string;
    repoName: string;
    entries: string[];
    currentPath: string;
    content: ContentChange["content"];
    cursorLine: null | number;
    topOffsetPct: null | number;
};

export type WsServerMessage = Partial<BrowserState> & {
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
