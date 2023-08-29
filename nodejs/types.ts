export interface CursorMove {
    cursorLine: number;
    contentLen: number;
    winHeight: number;
    winLine: number;
    sync_scroll_type: "middle" | "top" | "relative";
}

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

export interface WsServerMessage {
    root: string;
    currentEntry: CurrentEntry;
    repoName?: string;
    cursorMove?: CursorMove;
    goodbye?: true;
    entries?: Entry[];
}

export interface WsBrowserMessage {
    currentBrowserEntry: Entry;
}
