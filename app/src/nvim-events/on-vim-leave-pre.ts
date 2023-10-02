import { type Nvim } from "bunvim";
import { type CustomEvents } from "../types.ts";

export async function onVimLeavePre(
    nvim: Nvim<CustomEvents>,
    callback: (args: CustomEvents["requests"]["VimLeavePre"]) => unknown,
) {
    // Subscribe to RPCNotification
    await nvim.call("nvim_subscribe", ["CursorMove"]);

    // Request handler
    nvim.onRequest("VimLeavePre", callback);

    // Create autocmd to notify us with event "CursorMove"
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        ["VimLeavePre"],
        {
            desc: "Notify github-preview",
            command: `lua
            vim.rpcrequest(${channelId}, "VimLeavePre")`,
        },
    ]);
}
