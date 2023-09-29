import { type EventsMap } from "bunvim";

export type CustomEvents = {
    requests: EventsMap;
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
