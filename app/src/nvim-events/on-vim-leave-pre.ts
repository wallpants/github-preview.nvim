import { type Nvim } from "bunvim";
import { type CustomEvents } from "../types.ts";

export async function onVimLeavePre(
    nvim: Nvim<CustomEvents>,
    callback: (args: CustomEvents["requests"]["VimLeavePre"]) => unknown,
) {
    // Request handler
    nvim.onRequest("VimLeavePre", callback);

    // Create autocmd to make RPCRequest "VimLeavePre"
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
