import { type GithubPreview } from "../github-preview.ts";
import { type Config } from "../types.ts";

const REQUEST = "onConfigUpdate";

export function onConfigUpdate(
    app: GithubPreview,
    callback: (configUpdate: Partial<Config>) => null,
) {
    // Request handler
    app.nvim.onRequest(REQUEST, ([updateAction]) => {
        const update: Partial<Config> = {};

        switch (updateAction) {
            case "cursorline_enable":
                update.cursor_line = {
                    ...app.config.overrides.cursor_line,
                    disable: false,
                };
                break;
            case "cursorline_disable":
                update.cursor_line = {
                    ...app.config.overrides.cursor_line,
                    disable: true,
                };
                break;
        }

        return callback(update);
    });
}
