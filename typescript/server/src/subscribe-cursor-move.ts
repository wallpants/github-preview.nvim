import { type Nvim } from "bunvim";
import { type ApiInfo } from "./types.ts";

export async function subscribeCursorMove(
    nvim: Nvim<ApiInfo>,
    callback: (cursorLine: number) => Promise<void>,
) {
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["CursorHoldI", "CursorHold"],
        {
            desc: "Notify github-preview",
            command: `lua
            local buffer = vim.api.nvim_get_current_buf()
            vim.rpcnotify(${channelId}, "CursorHold", buffer)`,
        },
    ]);

    nvim.onNotification("CursorHold", async ([_buffer]) => {
        const [, cursorLine] = await nvim.call("nvim_win_get_cursor", [0]);
        await callback(cursorLine - 1);
    });
}
