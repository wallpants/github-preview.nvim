import { NVIM_LOG_LEVELS } from "bunvim";
import { type GithubPreview } from "../github-preview.ts";
import { type Config } from "../types.ts";

const REQUEST = "on_config_update";

export function onConfigUpdate(
    app: GithubPreview,
    callback: (configUpdate: Partial<Config>) => null,
) {
    // Request handler
    app.nvim.onRequest(REQUEST, async ([update_action]) => {
        const update: Partial<Config> = {};

        switch (update_action) {
            case "single_file_enable":
                update.single_file = true;
                break;
            case "single_file_disable":
                if (app.config.dotfiles.single_file) {
                    await app.nvim.call("nvim_notify", [
                        "github-preview: if plugin launched in single-file mode, it cannot be changed.",
                        NVIM_LOG_LEVELS.WARN,
                        {},
                    ]);
                    break;
                }
                update.single_file = false;
                break;
            case "details_tags_open":
                update.details_tags_open = true;
                break;
            case "details_tags_closed":
                update.details_tags_open = false;
                break;
            case "scroll_enable":
                update.scroll = {
                    ...app.config.overrides.scroll,
                    disable: false,
                };
                break;
            case "scroll_disable":
                update.scroll = {
                    ...app.config.overrides.scroll,
                    disable: true,
                };
                break;
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
