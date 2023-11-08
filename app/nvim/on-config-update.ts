import { type Awaitable } from "bunvim";
import { type GithubPreview } from "../github-preview.ts";
import { type CustomEvents } from "../types.ts";

const REQUEST = "on_config_update";

export function onConfigUpdate(
    app: GithubPreview,
    callback: (args: CustomEvents["requests"][typeof REQUEST]) => Awaitable<null>,
) {
    // Request handler
    app.nvim.onRequest(REQUEST, callback);
}
