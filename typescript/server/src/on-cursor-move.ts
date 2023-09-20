import { type Awaitable, type Nvim } from "bunvim";
import { type ApiInfo, type NotificationsMap } from "./types.ts";

export async function onCursorMove(
    nvim: Nvim<ApiInfo>,
    callback: (args: NotificationsMap["CursorMove"]) => Awaitable<void>,
) {
    // We handle buffer subscriptions onCursorMove
    // Whenever we enter to a new buffer, we detach from
    // any attached buffers and attach to the new buffer
    let attachedBuffer: null | number = null;

    // Buffer may have been implicitly detached
    // https://neovim.io/doc/user/api.html#nvim_buf_detach_event
    nvim.onNotification("nvim_buf_detach_event", ([buffer]) => {
        if (attachedBuffer === buffer) attachedBuffer = null;
    });

    // Subscribe to RPCNotification
    await nvim.call("nvim_subscribe", ["CursorMove"]);

    // Notification handler
    nvim.onNotification("CursorMove", async ([buffer, path, cursor_line]) => {
        if (!path) return;

        if (attachedBuffer !== buffer) {
            if (attachedBuffer !== null) {
                await nvim.call("nvim_buf_detach", [buffer]);
                attachedBuffer = null;
            }
            // attach to buffer to receive content change notifications
            const attached = await nvim.call("nvim_buf_attach", [buffer, false, {}]);
            if (attached) attachedBuffer = buffer;
        }

        await callback([buffer, path, cursor_line]);
    });

    // Create autocmd to notify us with event "CursorMove"
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["BufEnter", "CursorHold", "CursorHoldI"],
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
