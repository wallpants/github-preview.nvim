import { CursorMoveSchema, ENV, type CursorMove } from "@gp/shared";
import { type Nvim } from "bunvim";
import { parse } from "valibot";
import { type ApiInfo, type NotificationsMap } from "./types.ts";
import { isValidBuffer } from "./utils.ts";

const CURSOR_MOVE: keyof NotificationsMap = "cursor_move";

export async function subscribeCursorMove(
    nvim: Nvim<ApiInfo>,
    callback: (cursorMove: CursorMove) => Promise<void>,
) {
    const [channelId] = (await nvim.call("nvim_get_api_info", [])) as [number];
    await nvim.call("nvim_create_autocmd", [
        ["CursorHoldI", "CursorHold"],
        {
            desc: "Notify github-preview on cursor move",
            command: `lua
            local buffer_id = vim.api.nvim_get_current_buf()
            local abs_path = vim.api.nvim_buf_get_name(0)
            local cursor_line = vim.api.nvim_win_get_cursor(0)[1] - 1

            local cursor_move = {
                buffer_id = buffer_id,
                abs_path = abs_path,
                cursor_line = cursor_line
            }

            vim.rpcnotify(${channelId}, "${CURSOR_MOVE}", cursor_move)`,
        },
    ]);

    nvim.onNotification("cursor_move", async ([cursorMove]) => {
        ENV.IS_DEV && parse(CursorMoveSchema, cursorMove);
        if (!isValidBuffer(cursorMove.abs_path)) return;
        await callback(cursorMove);
    });
}
