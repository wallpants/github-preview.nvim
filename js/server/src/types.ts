export interface Entry {
    relativeToRoot: string;
    type: "file" | "dir";
}

export interface EntryContent {
    markdown: string;
    fileExt: string;
}

export type CurrentEntry = Entry & {
    content?: EntryContent;
};

export interface WsBrowserMessage {
    currentBrowserEntry: Entry;
}

export interface CursorMove {
    cursor_line: number;
    content_len: number;
    win_height: number;
    win_line: number;
    sync_scroll_type: "middle" | "top" | "relative";
}

export interface WsServerMessage {
    root: string;
    currentEntry: CurrentEntry;
    repoName?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
    entries?: Entry[];
}
