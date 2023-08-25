export type PluginProps = {
    port: number;
    scroll_debounce_ms: number;
    buffer_id: number;
    disable_sync_scroll: boolean;
    sync_scroll_type: "middle" | "top" | "relative";
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

export type ServerMessage = {
    markdown?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
};
