import { boolean, number, object, string, type Output } from "valibot";

export type BrowserState = {
    root: string;
    repoName: string;
    entries: string[];
    currentPath: string;
    content: null | string;
    syncScrollEnabled: boolean;
};

export const CursorMoveSchema = object({
    abs_path: string(),
    cursor_line: number(),
});
export type CursorMove = Output<typeof CursorMoveSchema>;

export const ContentChangeSchema = object({
    content: string(),
    abs_path: string(),
});
export type ContentChange = Output<typeof ContentChangeSchema>;

export type WsServerMessage = Partial<BrowserState> & {
    repoName?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
};

export type WsSend = (m: WsServerMessage) => void;

export const PluginInitSchema = object({
    /** port to host the http/ws server "localhost:\{port\}" */
    port: number(),
    /** dir path where ".git" dir was found */
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
    sync_scroll_enabled: boolean(),
});
export type PluginInit = Output<typeof PluginInitSchema>;

export type WsBrowserRequest =
    | {
          type: "init";
      }
    | {
          type: "getEntry";
          currentPath: string;
      };
