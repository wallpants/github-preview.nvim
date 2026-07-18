import { relative } from "node:path";
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

   // Notification handler.
   // Handled through a queue: rapid buffer switches could otherwise interleave
   // across the awaits below and detach/attach the wrong buffer
   let attachQueue = Promise.resolve();
   app.nvim.onNotification(NOTIFICATION, ([buffer, path]) => {
      if (!path) return;

      attachQueue = attachQueue
         .then(async () => {
            if (attachedBuffer === buffer) return;

            if (attachedBuffer !== null) {
               await app.nvim.call("nvim_buf_detach", [attachedBuffer]);
               attachedBuffer = null;
            }
            // attach to buffer to receive content change notifications
            const attached = await app.nvim.call("nvim_buf_attach", [buffer, true, {}]);
            if (attached) attachedBuffer = buffer;
         })
         .catch((err: unknown) => {
            app.nvim.logger?.error({ attach_buffer_error: err });
         });
   });

   // Create autocmd to notify us with event "attach_buffer"
   await app.nvim.call("nvim_create_autocmd", [
      ["InsertEnter", "TextChanged"],
      {
         group: app.augroupId,
         desc: "Notify github-preview",
         command: `lua
            local buftype = vim.api.nvim_get_option_value("buftype", { buf = 0 })
            if buftype == "" then
               local buffer = vim.api.nvim_get_current_buf()
               local path = vim.api.nvim_buf_get_name(0)
               vim.rpcnotify(${app.nvim.channelId}, "${NOTIFICATION}", buffer, path)
            end`,
      },
   ]);

   // "nvim_buf_lines_event" and "nvim_buf_changedtick_event" events are
   // only emitted by neovim if we've attached a buffer.
   app.nvim.onNotification(
      "nvim_buf_lines_event",
      async ([buffer, _changedtick, firstline, lastline, linedata, _more]) => {
         const path = await app.nvim.call("nvim_buf_get_name", [buffer]);
         const replaceAll = lastline === -1 && firstline === 0;

         let newContent: string[];
         if (replaceAll) {
            newContent = linedata;
         } else if (relative(app.root, path) === app.currentPath) {
            const deleteCount = lastline - firstline;
            newContent = app.lines.toSpliced(firstline, deleteCount, ...linedata);
         } else {
            // app.lines mirrors a different file (e.g. browser navigated away),
            // an incremental splice would corrupt it. Fetch the full buffer instead.
            newContent = await app.nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
         }

         callback(newContent, path);
      },
   );

   app.nvim.onNotification("nvim_buf_changedtick_event", async ([buffer, _changedtick]) => {
      const path = await app.nvim.call("nvim_buf_get_name", [buffer]);
      const linedata = await app.nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
      callback(linedata, path);
   });
}
