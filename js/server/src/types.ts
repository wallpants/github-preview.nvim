import { boolean, literal, number, object, string, union, type Output } from "valibot";

export type CurrentEntry = {
    absPath: string;
    content?: string | undefined;
};

export const CursorMoveSchema = object({
    abs_path: string(),
    cursor_line: number(),
    content_len: number(),
    win_height: number(),
    win_line: number(),
});
export type CursorMove = Output<typeof CursorMoveSchema>;

export const ContentChangeSchema = object({
    content: string(),
    abs_path: string(),
});
export type ContentChange = Output<typeof ContentChangeSchema>;

export type BrowserState = {
    root: string;
    entries: string[];
    currentEntry: CurrentEntry;
};

export type WsServerMessage = Partial<BrowserState> & {
    repoName?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
};

export const PluginInitSchema = object({
    /**
     * port to host the http/ws server "localhost:\{port\}"
     * @default
     * 4002
     * */
    port: number(),
    /**
     * dir path where ".git" dir was found
     * */
    root: string(),
    /**
     * current path when plugin was loaded
     * if no buffer was loaded when plugin started, path is dir and ends with "/"
     * otherwise path looks something like "/Users/.../README.md"
     * */
    path: string(),
    content: string(),
    scroll_debounce_ms: number(),
    disable_sync_scroll: boolean(),
    sync_scroll_type: union([literal("middle"), literal("top"), literal("relative")]),
});
export type PluginInit = Output<typeof PluginInitSchema>;

export type WsBrowserRequest =
    | {
          type: "init";
      }
    | {
          type: "getEntries";
          absPath?: string;
      }
    | {
          type: "getEntry";
          absPath: string;
      };
