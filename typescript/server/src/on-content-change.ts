import { type BrowserState } from "@gp/shared";
import { type Nvim } from "bunvim";
import { type ApiInfo } from "./types.ts";

export function onContentChange(
    nvim: Nvim<ApiInfo>,
    browserState: BrowserState,
    callback: (content: string[], path: string) => Promise<void>,
) {
    // "nvim_buf_lines_event" and "nvim_buf_changedtick_event" events are
    // only sent by neovim if we've attached a buffer.
    // We handle buffer attach and detach in onBufEnter.
    nvim.onNotification(
        "nvim_buf_lines_event",
        async ([buffer, _changedtick, firstline, lastline, linedata, _more]) => {
            const path = await nvim.call("nvim_buf_get_name", [buffer]);
            const replaceAll = lastline === -1 && firstline === 0;
            const deleteCount = lastline - firstline;
            const newContent = replaceAll
                ? linedata
                : browserState.content.toSpliced(firstline, deleteCount, ...linedata);
            await callback(newContent, path);
        },
    );

    nvim.onNotification("nvim_buf_changedtick_event", async ([buffer, _changedtick]) => {
        const path = await nvim.call("nvim_buf_get_name", [buffer]);
        const linedata = await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        await callback(linedata, path);
    });
}
