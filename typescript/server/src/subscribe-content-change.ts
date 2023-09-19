import { CursorMoveSchema, ENV, type ContentChange } from "@gp/shared";
import { type Nvim } from "bunvim";
import { parse } from "valibot";
import { type ApiInfo } from "./types.ts";
import { isValidBuffer } from "./utils.ts";

export function subscribeContentChange(
    nvim: Nvim<ApiInfo>,
    callback: (contentChange: ContentChange) => Promise<void>,
) {
    let subscribedBufferId: number | null = null;

    nvim.onNotification("cursor_move", async ([cursorMove]) => {
        ENV.IS_DEV && parse(CursorMoveSchema, cursorMove);
        if (!isValidBuffer(cursorMove.abs_path)) return;

        if (cursorMove.buffer_id !== subscribedBufferId) {
            if (subscribedBufferId !== null) {
                await nvim.call("nvim_buf_detach", [subscribedBufferId]);
            }

            const attached = await nvim.call("nvim_buf_attach", [cursorMove.buffer_id, true, {}]);
            if (!attached) {
                nvim.logger?.error("failed to attach to buffer");
                subscribedBufferId = null;
                return;
            }
            subscribedBufferId = cursorMove.buffer_id;
        }
    });

    nvim.onNotification(
        "nvim_buf_lines_event",
        ([buffer, changedtick, firstline, lastline, linedata, more]) => {
            nvim.logger?.verbose({
                event: "nvim_buf_lines_event",
                buffer,
                changedtick,
                firstline,
                lastline,
                linedata,
                more,
            });
        },

        // TODO: create content with diff & call callback
    );

    nvim.onNotification("nvim_buf_changedtick_event", ([buffer, changedtick]) => {
        nvim.logger?.verbose({
            event: "nvim_buf_changedtick_event",
            buffer,
            changedtick,
        });
        // TODO: get all content from buffer & call callback
    });
}
