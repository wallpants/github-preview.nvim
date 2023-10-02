import { type Output } from "valibot";
import type { ContentChangeSchema, CursorMoveSchema, PluginInitSchema } from "./schemas";

export type PluginInit = Output<typeof PluginInitSchema>;
export type CursorMove = Output<typeof CursorMoveSchema>;
export type ContentChange = Output<typeof ContentChangeSchema>;

export type BrowserState = {
    root: string;
    repoName: string;
    currentPath: string;
    content: ContentChange["content"];
    cursorLineColor: string;
    cursorLine: null | number;
    topOffsetPct: null | number;
};

export type WsServerMessage = Partial<BrowserState> & {
    goodbye?: boolean;
    entries?: {
        path: string;
        list: string[];
    };
};

export type WsBrowserRequest =
    | {
          type: "init";
      }
    | {
          type: "getEntries";
          path: string;
      }
    | {
          type: "getEntry";
          path: string;
      };

export type CustomEvents = {
    requests: {
        VimLeavePre: [];
    };
    notifications: {
        // github-preview
        AttachBuffer: [buffer: number, path: string];
        CursorMove: [buffer: number, path: string, cursor_line: number];

        // neovim native
        nvim_buf_detach_event: [buffer: number];
        nvim_buf_lines_event: [
            buffer: number,
            changedtick: number,
            firstline: number,
            lastline: number,
            linedata: string[],
            more: boolean,
        ];
        nvim_buf_changedtick_event: [buffer: number, changedtick: number];
    };
};
