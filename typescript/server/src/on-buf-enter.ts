import { type Awaitable, type Nvim } from "bunvim";
import { type ApiInfo, type NotificationsMap } from "./types.ts";

export async function onBufEnter(
    nvim: Nvim<ApiInfo>,
    callback: (args: NotificationsMap["BufEnter"]) => Awaitable<void>,
) {
    // Subscribe to RPCNotification
    await nvim.call("nvim_subscribe", ["BufEnter"]);

    // Notification handler
    nvim.onNotification("BufEnter", callback);

    // Create autocmd to notify us on BufEnter
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["BufEnter"],
        {
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            local path = vim.api.nvim_buf_get_name(0)
            local cursor_line = vim.api.nvim_win_get_cursor(0)[1] - 1
            vim.rpcnotify(${channelId}, "BufEnter", buffer, path, cursor_line)`,
        },
    ]);
}
