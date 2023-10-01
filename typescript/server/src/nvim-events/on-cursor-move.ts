import { type Awaitable, type Nvim } from "bunvim";
import { type CustomEvents } from "../types.ts";

export async function onCursorMove(
    nvim: Nvim<CustomEvents>,
    callback: (args: CustomEvents["notifications"]["CursorMove"]) => Awaitable<void>,
) {
    // Subscribe to RPCNotification
    await nvim.call("nvim_subscribe", ["CursorMove"]);

    // Notification handler
    nvim.onNotification("CursorMove", callback);

    // Create autocmd to notify us with event "CursorMove"
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["CursorHold", "CursorHoldI"],
        {
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            local path = vim.api.nvim_buf_get_name(0)
            local cursor_line = vim.api.nvim_win_get_cursor(0)[1] - 1
            vim.rpcnotify(${channelId}, "CursorMove", buffer, path, cursor_line)`,
        },
    ]);
}
