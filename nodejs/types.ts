export type PluginProps = {
    port: number;
    scroll_debounce_ms: number;
    disable_sync_scroll: boolean;
    sync_scroll_type: "middle" | "top" | "relative";
    filepath: string;
};

export type NeovimNotificationArgs = Array<{
    id: number;
    match: string;
    buf: number;
    file: string;
    event: string;
}>;

export type CursorMove = {
    cursorLine: number;
    markdownLen: number;
    winHeight: number;
    winLine: number;
    sync_scroll_type: "middle" | "top" | "relative";
};

export type WsMessage = {
    repoName?: string;
    markdown?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
    entries?: Array<{ name: string; type: "file" | "dir" }>;
    relativeFilepath: string;
};
