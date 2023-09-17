import { ENV, PluginInitSchema, type PluginInit } from "@gp/shared";
import { attach } from "bunvim";
import { basename } from "node:path";
import { parse } from "valibot";
// import { getContent, getEntries, getRepoName } from "./utils.ts";

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket missing");

type NotificationsMap = {
    cursor_move: [{ buffer_id: number; abs_path: string; cursor_line: number }];
    nvim_buf_lines_event: [
        buffer: number,
        changedtick: number,
        firstline: number,
        lastline: number,
        linedata: string[],
        more: boolean,
    ];
    nvim_buf_changedtick_event: [buffer: number, changedtick: number];
};

const CURSOR_MOVE: keyof NotificationsMap = "cursor_move";

const nvim = await attach<NotificationsMap>({
    socket: SOCKET,
    logFile: ENV.GP_LOG_FILE,
    logLevel: ENV.GP_LOG_LEVEL,
});

const init = (await nvim.call("nvim_get_var", ["github_preview_init"])) as PluginInit;
if (ENV.IS_DEV) parse(PluginInitSchema, init);

// nvim.onNotification(
//     BUF_LINES_EVENT,
//     ([buffer, changedtick, firstline, lastline, linedata, more]) => {
//         nvim.logger?.verbose({ buffer, changedtick, firstline, lastline, linedata, more });
//     },
// );

// nvim.onNotification(BUF_CHANGEDTICK_EVENT, ([buffer, changedtick]) => {
//     nvim.logger?.verbose({ buffer, changedtick });
// });
let subscribedBufferId: number | null = null;

nvim.onNotification(CURSOR_MOVE, async ([{ buffer_id, abs_path, cursor_line }]) => {
    nvim.logger?.info({ subscribedBufferId, buffer_id, abs_path, cursor_line });
    // TODO(gualcasas): we need to check here if buffer is not in init.ignored
    const buffer = basename(abs_path);

    if (abs_path && buffer_id !== subscribedBufferId) {
        if (subscribedBufferId !== null) {
            await nvim.call("nvim_buf_detach", [subscribedBufferId]);
        }

        const attached = await nvim.call("nvim_buf_attach", [buffer_id, true, {}]);
        if (!attached) {
            nvim.logger?.error("failed to attach to buffer");
            return;
        }
        subscribedBufferId = buffer_id;
    }
});

// create autocmd to notify us on cursor move
const [channelId] = (await nvim.call("nvim_get_api_info", [])) as [number];
await nvim.call("nvim_create_autocmd", [
    // ["CursorHoldI", "CursorHold"],
    ["CursorHold"],
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

// logger.info({ attached });

// // const entries = await getEntries({
// //     root: init.root,
// //     currentPath: init.path,
// // });

// // const { currentPath, content, cursorLine } = getContent({
// //     currentPath: init.root,
// //     entries,
// //     newContent: init.content,
// // });

// // const browserState: BrowserState = {
// //     root: init.root,
// //     repoName: getRepoName({ root: init.root }),
// //     entries: entries,
// //     content,
// //     currentPath,
// //     disableSyncScroll: init.disable_sync_scroll,
// //     cursorLine: cursorLine !== undefined ? cursorLine : init.cursor_line,
// // };

// // nvim.onNotification("event-1", (args) => {
// //     console.log("args: ", args);
// // });
