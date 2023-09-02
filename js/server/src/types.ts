import { array, boolean, literal, number, object, string, union, type Output } from "valibot";

export interface Entry {
    relativeToRoot: string;
    type: "file" | "dir";
}

export interface EntryContent {
    markdown: string;
    fileExt: string;
}

export interface CurrentEntry extends Entry {
    content?: EntryContent;
}

export interface WsBrowserMessage {
    currentBrowserEntry: Entry;
}

export const CursorMoveSchema = object({
    cursor_line: number(),
    content_len: number(),
    win_height: number(),
    win_line: number(),
    sync_scroll_type: union([literal("middle"), literal("top"), literal("relative")]),
});
export type CursorMove = Output<typeof CursorMoveSchema>;

export const ContentChangeSchema = object({
    content: string(),
});
export type ContentChange = Output<typeof ContentChangeSchema>;

export interface WsServerMessage {
    root: string;
    currentEntry: CurrentEntry;
    repoName?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
    entries?: Entry[];
}

export const PluginPropsSchema = object({
    port: number(),
    cwd: string(),
    scroll_debounce_ms: number(),
    disable_sync_scroll: boolean(),
    ignore_buffer_patterns: array(string()),
    sync_scroll_type: union([literal("middle"), literal("top"), literal("relative")]),
});
