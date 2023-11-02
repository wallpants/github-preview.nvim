import { type Awaitable } from "bunvim";
import { type GithubPreview } from "../github-preview.ts";
import { type CustomEvents } from "../types.ts";

const NOTIFICATION = "CursorMove";

export async function onCursorMove(
    app: GithubPreview,
    callback: (args: CustomEvents["notifications"][typeof NOTIFICATION]) => Awaitable<void>,
) {
    // Notification handler
    app.nvim.onNotification(NOTIFICATION, callback);

    // Create autocmd to notify us with event "CursorMove"
    await app.nvim.call("nvim_create_autocmd", [
        ["CursorHold", "CursorHoldI"],
        {
            group: app.augroupId,
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            local path = vim.api.nvim_buf_get_name(0)
            local cursor_line = vim.api.nvim_win_get_cursor(0)[1]
            vim.rpcnotify(${app.nvim.channelId}, "${NOTIFICATION}", buffer, path, cursor_line)`,
        },
    ]);
}
