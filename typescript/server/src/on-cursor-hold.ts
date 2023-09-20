import { type Awaitable, type Nvim } from "bunvim";
import { type ApiInfo, type NotificationsMap } from "./types.ts";

export async function onCursorHold(
    nvim: Nvim<ApiInfo>,
    callback: (args: NotificationsMap["CursorHold"]) => Awaitable<void>,
) {
    // Subscribe to RPCNotification
    await nvim.call("nvim_subscribe", ["CursorHold"]);

    // Notification handler
    nvim.onNotification("CursorHold", callback);

    // Create autocmd to notify us
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["CursorHold", "CursorHoldI"],
        {
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            local path = vim.api.nvim_buf_get_name(0)
            local cursor_line = vim.api.nvim_win_get_cursor(0)[1] - 1
            vim.rpcnotify(${channelId}, "CursorHold", buffer, path, cursor_line)`,
        },
    ]);
}
