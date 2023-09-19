import { CursorMoveSchema, ENV, type BrowserState } from "@gp/shared";
import { type Nvim } from "bunvim";
import { parse } from "valibot";
import { type NeovimApi } from "./neovim.types.ts";
import { type ApiInfo } from "./types.ts";
import { isValidBuffer } from "./utils.ts";

let subscribedBufferId: null | number = null;

// TODO(gualcasas): maybe start subscription on InsertEnter rather than
// for all opened buffers
async function handleBufferSubscription(nvim: Nvim<NeovimApi>, newBufferId: number) {
    if (newBufferId !== subscribedBufferId) {
        if (subscribedBufferId !== null) {
            await nvim.call("nvim_buf_detach", [subscribedBufferId]);
        }
        const attached = await nvim.call("nvim_buf_attach", [newBufferId, true, {}]);
        if (!attached) {
            nvim.logger?.error("failed to attach to buffer");
            subscribedBufferId = null;
            return;
        }
        subscribedBufferId = newBufferId;
    }
}

export function subscribeContentChange(
    nvim: Nvim<ApiInfo>,
    browserState: BrowserState,
    callback: (newContent: string[]) => Promise<void>,
) {
    // We use cursor_move event to know when the user navigates to a different buffer
    // to detach (unsub) from previous buffer changes and attach (subscribe) to new
    nvim.onNotification("cursor_move", async ([cursorMove]) => {
        ENV.IS_DEV && parse(CursorMoveSchema, cursorMove);
        if (!isValidBuffer(cursorMove.abs_path)) return;

        await handleBufferSubscription(nvim, cursorMove.buffer_id);

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
        async ([_buffer, _changedtick, firstline, lastline, linedata, _more]) => {
            const deleteCount =
                lastline === -1 ? browserState.content.length - firstline : lastline - firstline;
            // TODO(gualcasas): maybe not create a new array every time? mutate existing array?
            const newContent = browserState.content.toSpliced(firstline, deleteCount, ...linedata);
            await callback(newContent);
        },
    );

    nvim.onNotification("nvim_buf_changedtick_event", async ([buffer, _changedtick]) => {
        const linedata = await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        await callback(linedata);
    });
}
