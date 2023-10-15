import { type Nvim } from "bunvim";
import { type CustomEvents } from "../types.ts";

const REQUEST = "VimLeavePre";

export async function onVimLeavePre(
    nvim: Nvim<CustomEvents>,
    augroupId: number,
    callback: (args: CustomEvents["requests"][typeof REQUEST]) => unknown,
) {
    // Request handler
    nvim.onRequest(REQUEST, callback);

    // Create autocmd to make RPCRequest
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        [REQUEST],
        {
            group: augroupId,
            desc: "Notify github-preview",
            command: `lua
            vim.rpcrequest(${channelId}, "${REQUEST}")`,
        },
    ]);
}
