import { type Awaitable, type Nvim } from "bunvim";
import { type CustomEvents } from "../types.ts";

const NOTIFICATION = "CursorMove";

export async function onCursorMove(
    nvim: Nvim<CustomEvents>,
    augroupId: number,
    callback: (args: CustomEvents["notifications"][typeof NOTIFICATION]) => Awaitable<void>,
) {
    // Subscribe to RPCNotification
    await nvim.call("nvim_subscribe", [NOTIFICATION]);

    // Notification handler
    nvim.onNotification(NOTIFICATION, callback);

    // Create autocmd to notify us with event "CursorMove"
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["CursorHold", "CursorHoldI"],
        {
            group: augroupId,
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            local path = vim.api.nvim_buf_get_name(0)
            local cursor_line = vim.api.nvim_win_get_cursor(0)[1]
            vim.rpcnotify(${channelId}, "${NOTIFICATION}", buffer, path, cursor_line)`,
        },
    ]);
}
