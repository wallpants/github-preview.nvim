import { type BrowserState } from "@gp/shared";
import { type Nvim } from "bunvim";
import { type ApiInfo } from "./types.ts";

type Callback = (
    newContent: string[],
    newPath: string,
    newCursorLine: number | null,
) => Promise<void>;

export async function subscribeContentChange(
    nvim: Nvim<ApiInfo>,
    browserState: BrowserState,
    callback: Callback,
) {
    await attachBufferOnInsertEnter(nvim, browserState, callback);
    await readContentOnBufEnter(nvim, callback);
}

async function readContentOnBufEnter(nvim: Nvim<ApiInfo>, callback: Callback) {
    // Subscribe to RPCNotification "BufEnter"
    await nvim.call("nvim_subscribe", ["BufEnter"]);

    // Notification handler
    nvim.onNotification("BufEnter", async ([buffer]) => {
        const lines = await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        const path = await nvim.call("nvim_buf_get_name", [0]);
        const [, cursorLine] = await nvim.call("nvim_win_get_cursor", [0]);
        await callback(lines, path, cursorLine - 1);
    });

    // Create autocmd to notify us on BufEnter
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["BufEnter"],
        {
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            vim.rpcnotify(${channelId}, "BufEnter", buffer)`,
        },
    ]);
}

async function attachBufferOnInsertEnter(
    nvim: Nvim<ApiInfo>,
    browserState: BrowserState,
    callback: Callback,
) {
    let attachedBuffer: null | number = null;

    // Subscribe to RPCNotification "InsertEnter"
    await nvim.call("nvim_subscribe", ["InsertEnter"]);

    // Buffer may have been implicitly detached
    // https://neovim.io/doc/user/api.html#nvim_buf_detach_event
    nvim.onNotification("nvim_buf_detach_event", ([buffer]) => {
        if (attachedBuffer === buffer) attachedBuffer = null;
    });

    // Notification handler
    nvim.onNotification("InsertEnter", async ([buffer]) => {
        if (attachedBuffer === buffer) return;

        if (attachedBuffer !== null) {
            await nvim.call("nvim_buf_detach", [buffer]);
            attachedBuffer = null;
        }

        // attach to buffer to receive content change notifications
        const attached = await nvim.call("nvim_buf_attach", [buffer, true, {}]);
        if (attached) attachedBuffer = buffer;
    });

    // Create autocmd to notify us on InsertEnter
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["InsertEnter"],
        {
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            vim.rpcnotify(${channelId}, "InsertEnter", buffer)`,
        },
    ]);

    nvim.onNotification(
        "nvim_buf_lines_event",
        async ([buffer, _changedtick, firstline, lastline, linedata, _more]) => {
            nvim.logger?.verbose("nvim_buf_lines_event");
            const path = await nvim.call("nvim_buf_get_name", [buffer]);
            const replaceAll = lastline === -1 && firstline === 0;
            const deleteCount = lastline - firstline;
            const newContent = replaceAll
                ? linedata
                : browserState.content.toSpliced(firstline, deleteCount, ...linedata);
            await callback(newContent, path, browserState.cursorLine);
        },
    );

    nvim.onNotification("nvim_buf_changedtick_event", async ([buffer, _changedtick]) => {
        nvim.logger?.verbose("nvim_buf_changedtick_event");
        const path = await nvim.call("nvim_buf_get_name", [buffer]);
        const linedata = await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        const [, cursorLine] = await nvim.call("nvim_win_get_cursor", [0]);
        await callback(linedata, path, cursorLine - 1);
    });
}
