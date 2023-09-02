import { array, boolean, literal, number, object, string, union, type Output } from "valibot";

export interface EntryContent {
    markdown: string;
    fileExt: string;
}

export interface CurrentEntry {
    absPath: string;
    content?: EntryContent | undefined;
}

export interface WsBrowserMessage {
    currentBrowserPath: string;
}

export const CursorMoveSchema = object({
    abs_file_path: string(),
    cursor_line: number(),
    content_len: number(),
    win_height: number(),
    win_line: number(),
});
export type CursorMove = Output<typeof CursorMoveSchema>;

export const ContentChangeSchema = object({
    content: string(),
    abs_file_path: string(),
});
export type ContentChange = Output<typeof ContentChangeSchema>;

export interface WsServerMessage {
    root: string;
    currentEntry?: CurrentEntry;
    repoName?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
    entries?: string[];
}

export const PluginConfigSchema = object({
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
    init_path: string(),
    scroll_debounce_ms: number(),
    disable_sync_scroll: boolean(),
    ignore_buffer_patterns: array(string()),
    sync_scroll_type: union([literal("middle"), literal("top"), literal("relative")]),
});
export type PluginConfig = Output<typeof PluginConfigSchema>;
