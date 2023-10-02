import { type Nvim } from "bunvim";
import { type BrowserState, type CustomEvents } from "../types.ts";

export async function onContentChange(
    nvim: Nvim<CustomEvents>,
    browserState: BrowserState,
    callback: (content: string[], path: string) => void,
) {
    // We attach buffers to receive notifications on content change
    let attachedBuffer: null | number = null;

    // Buffer may have been implicitly detached
    // https://neovim.io/doc/user/api.html#nvim_buf_detach_event
    nvim.onNotification("nvim_buf_detach_event", ([buffer]) => {
        if (attachedBuffer === buffer) attachedBuffer = null;
    });

    // Subscribe to RPCNotification
    await nvim.call("nvim_subscribe", ["AttachBuffer"]);

    // Notification handler
    nvim.onNotification("AttachBuffer", async (args) => {
        // args[0] buffer
        // args[1] path
        if (!args[1]) return;

        if (attachedBuffer !== args[0]) {
            if (attachedBuffer !== null) {
                await nvim.call("nvim_buf_detach", [attachedBuffer]);
                attachedBuffer = null;
            }
            // attach to buffer to receive content change notifications
            const attached = await nvim.call("nvim_buf_attach", [args[0], true, {}]);
            if (attached) attachedBuffer = args[0];
        }
    });

    // Create autocmd to notify us with event "AttachBuffer"
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["InsertEnter", "TextChanged"],
        {
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            local path = vim.api.nvim_buf_get_name(0)
            vim.rpcnotify(${channelId}, "AttachBuffer", buffer, path)`,
        },
    ]);

    // "nvim_buf_lines_event" and "nvim_buf_changedtick_event" events are
    // only emitted by neovim if we've attached a buffer.
    nvim.onNotification(
        "nvim_buf_lines_event",
        async ([buffer, _changedtick, firstline, lastline, linedata, _more]) => {
            const path = await nvim.call("nvim_buf_get_name", [buffer]);
            const replaceAll = lastline === -1 && firstline === 0;
            const deleteCount = lastline - firstline;
            const newContent = replaceAll
                ? linedata
                : browserState.content.toSpliced(firstline, deleteCount, ...linedata);
            callback(newContent, path);
        },
    );

    nvim.onNotification("nvim_buf_changedtick_event", async ([buffer, _changedtick]) => {
        const path = await nvim.call("nvim_buf_get_name", [buffer]);
        const linedata = await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        callback(linedata, path);
    });
}
