import { type GithubPreview } from "../github-preview.ts";

const NOTIFICATION = "attach_buffer";

export async function onContentChange(
    app: GithubPreview,
    callback: (content: string[], path: string) => void,
) {
    // We attach buffers to receive notifications on content change
    let attachedBuffer: null | number = null;

    // Buffer may have been implicitly detached
    // https://neovim.io/doc/user/api.html#nvim_buf_detach_event
    app.nvim.onNotification("nvim_buf_detach_event", ([buffer]) => {
        if (attachedBuffer === buffer) attachedBuffer = null;
    });

    // Notification handler
    app.nvim.onNotification(NOTIFICATION, async ([buffer, path]) => {
        if (!path) return;

        if (attachedBuffer !== buffer) {
            if (attachedBuffer !== null) {
                await app.nvim.call("nvim_buf_detach", [attachedBuffer]);
                attachedBuffer = null;
            }
            // attach to buffer to receive content change notifications
            const attached = await app.nvim.call("nvim_buf_attach", [buffer, true, {}]);
            if (attached) attachedBuffer = buffer;
        }
    });

    // Create autocmd to notify us with event "attach_buffer"
    await app.nvim.call("nvim_create_autocmd", [
        ["InsertEnter", "TextChanged"],
        {
            group: app.augroupId,
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            local path = vim.api.nvim_buf_get_name(0)
            vim.rpcnotify(${app.nvim.channelId}, "${NOTIFICATION}", buffer, path)`,
        },
    ]);

    // "nvim_buf_lines_event" and "nvim_buf_changedtick_event" events are
    // only emitted by neovim if we've attached a buffer.
    app.nvim.onNotification(
        "nvim_buf_lines_event",
        async ([buffer, _changedtick, firstline, lastline, linedata, _more]) => {
            const path = await app.nvim.call("nvim_buf_get_name", [buffer]);
            const replaceAll = lastline === -1 && firstline === 0;
            const deleteCount = lastline - firstline;
            const newContent = replaceAll
                ? linedata
                : app.lines.toSpliced(firstline, deleteCount, ...linedata);
            callback(newContent, path);
        },
    );

    app.nvim.onNotification("nvim_buf_changedtick_event", async ([buffer, _changedtick]) => {
        const path = await app.nvim.call("nvim_buf_get_name", [buffer]);
        const linedata = await app.nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        callback(linedata, path);
    });
}
