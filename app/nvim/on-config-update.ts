import { NVIM_LOG_LEVELS } from "bunvim";
import { type GithubPreview } from "../github-preview.ts";
import { type Config } from "../types.ts";

const REQUEST = "on_config_update";

export function onConfigUpdate(
    app: GithubPreview,
    callback: (configUpdate: Partial<Config>) => null,
) {
    const { dotfiles, overrides } = app.config;

    // Request handler
    app.nvim.onRequest(REQUEST, async ([update_action]) => {
        let update: Partial<Config> = {};

        async function updateSingleFile(dotfileValue: boolean, newValue: boolean) {
            // we need a function to validate single-file mode config updates
            // because single-file mode cannot be disabled if plugin launched
            // in single-file mode
            if (dotfileValue && !newValue) {
                await app.nvim.call("nvim_notify", [
                    "github-preview: if plugin launched in single-file mode, it cannot be changed.",
                    NVIM_LOG_LEVELS.WARN,
                    {},
                ]);
            } else {
                update.single_file = newValue;
            }
        }

        switch (update_action) {
            case "clear_overrides":
                update = dotfiles;
                break;
            case "single_file_toggle": {
                await updateSingleFile(dotfiles.single_file, !overrides.single_file);
                break;
            }
            case "single_file_on":
                await updateSingleFile(dotfiles.single_file, true);
                break;
            case "single_file_off":
                await updateSingleFile(dotfiles.single_file, false);
                break;
            case "details_tags_toggle":
                update.details_tags_open = !overrides.details_tags_open;
                break;
            case "details_tags_open":
                update.details_tags_open = true;
                break;
            case "details_tags_closed":
                update.details_tags_open = false;
                break;
            case "scroll_toggle":
                update.scroll = { ...overrides.scroll, disable: !overrides.scroll.disable };
                break;
            case "scroll_on":
                update.scroll = { ...overrides.scroll, disable: false };
                break;
            case "scroll_off":
                update.scroll = { ...overrides.scroll, disable: true };
                break;
            case "cursorline_toggle":
                update.cursor_line = {
                    ...overrides.cursor_line,
                    disable: !overrides.cursor_line.disable,
                };
                break;
            case "cursorline_on":
                update.cursor_line = { ...overrides.cursor_line, disable: false };
                break;
            case "cursorline_off":
                update.cursor_line = { ...overrides.cursor_line, disable: true };
                break;
        }

        return callback(update);
    });
}
