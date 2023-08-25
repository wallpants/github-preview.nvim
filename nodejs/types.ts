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
};

export type ServerMessage = {
    markdown?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
};
