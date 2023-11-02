import { type GithubPreview } from "../github-preview.ts";
import { type CustomEvents } from "../types.ts";

const REQUEST = "onBeforeExit";

export async function onBeforeExit(
    app: GithubPreview,
    callback: (args: CustomEvents["requests"][typeof REQUEST]) => unknown,
) {
    // Request handler
    app.nvim.onRequest(REQUEST, callback);

    // Create autocmd to make RPCRequest
    await app.nvim.call("nvim_create_autocmd", [
        ["VimLeavePre"],
        {
            group: app.augroupId,
            desc: "Notify github-preview",
            command: `lua
            vim.rpcrequest(${app.nvim.channelId}, "${REQUEST}")`,
        },
    ]);
}
