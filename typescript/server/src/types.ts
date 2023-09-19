import { type CursorMove } from "@gp/shared";
import { type NeovimApi } from "./neovim.types.ts";

export type NotificationsMap = {
    // github-preview
    cursor_move: [CursorMove];

    // neovim native
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

export type ApiInfo = NeovimApi<NotificationsMap>;
