import { CursorMoveSchema, ENV, type BrowserState } from "@gp/shared";
import { type Nvim } from "bunvim";
import { parse } from "valibot";
import { type ApiInfo } from "./types.ts";
import { isValidBuffer } from "./utils.ts";

export function subscribeContentChange(
    nvim: Nvim<ApiInfo>,
    browserState: BrowserState,
    callback: (newContent: string[], newPath: string, newCursorLine?: number) => Promise<void>,
) {
    let subscribedBufferId: null | number = null;

    // We use cursor_move event to know when the user navigates to a different buffer
    // to detach (unsub) from previous buffer changes and attach (subscribe) to new
    nvim.onNotification("cursor_move", async ([cursorMove]) => {
        ENV.IS_DEV && parse(CursorMoveSchema, cursorMove);
        if (!isValidBuffer(cursorMove.abs_path)) return;
        // TODO(gualcasas): maybe start subscription on InsertEnter rather than for all opened buffers
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
        async ([buffer, _changedtick, firstline, lastline, linedata, _more]) => {
            nvim.logger?.info("nvim_buf_lines_event");
            const path = await nvim.call("nvim_buf_get_name", [buffer]);
            const deleteCount =
                lastline === -1 ? browserState.content.length - firstline : lastline - firstline;

            const newData =
                path === browserState.currentPath
                    ? {
                          cursorLine: undefined,
                          content: browserState.content.toSpliced(
                              firstline,
                              deleteCount,
                              ...linedata,
                          ),
                      }
                    : {
                          cursorLine: (await nvim.call("nvim_win_get_cursor", [0]))[1] - 1,
                          // If the user navigates on the browser to a different file and then makes some changes
                          // in the editor without first moving the cursor, linedata won't really apply to the current
                          // browserState.content as they refer to different files
                          content: await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]),
                      };

            await callback(newData.content, path, newData.cursorLine);
        },
    );

    nvim.onNotification("nvim_buf_changedtick_event", async ([buffer, _changedtick]) => {
        nvim.logger?.info("nvim_buf_changedtick_event");
        const path = await nvim.call("nvim_buf_get_name", [buffer]);
        const linedata = await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        await callback(linedata, path);
    });
}
