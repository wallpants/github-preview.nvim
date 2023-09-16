import { ENV, PluginInitSchema, type PluginInit } from "@gp/shared";
import { attach } from "bunvim";
import { parse } from "valibot";
// import { getContent, getEntries, getRepoName } from "./utils.ts";

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket missing");

const CURSOR_MOVE = "cursor_move";

// define notification names & payload structures
type NotificationsMap = {
    "*": unknown[]; // "*" is the catch-all event name
    [CURSOR_MOVE]: [{ abs_path: string; cursor_line: number }];
};

const nvim = await attach<NotificationsMap>({ socket: SOCKET });

// get initialization params
const init = (await nvim.call("nvim_get_var", ["github_preview_init"])) as PluginInit;
if (ENV.IS_DEV) parse(PluginInitSchema, init);

// nvim.onNotification("cursor_move", ([{ abs_path, cursor_line }]) => {
//     logger.info({ abs_path, cursor_line });
// });

// create autocmd to notify us on cursor move
// const [channelId] = (await nvim.call("nvim_get_api_info", [])) as [number];
// await nvim.call("nvim_create_autocmd", [
//     // ["CursorHoldI", "CursorHold"],
//     ["CursorHold"],
//     {
//         desc: "Notify github-preview on cursor move",
//         command: `lua
//             local cursor_line = vim.api.nvim_win_get_cursor(0)[1] - 1
//             local buffer_name = vim.api.nvim_buf_get_name(0)

//             local cursor_move = {
//                 abs_path = buffer_name,
//                 cursor_line = cursor_line
//             }

//             vim.rpcnotify(${channelId}, "${CURSOR_MOVE}", cursor_move)`,
//     },
// ]);

// await nvim.call("nvim_buf_attach", [0, true, {}]);
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
