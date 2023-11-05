import { useContext } from "react";
import { type Config } from "../../../../types";
import { cn } from "../../../utils";
import { FoldVerticalIcon } from "../../icons/fold-vertical";
import { MoonIcon } from "../../icons/moon";
import { SunIcon } from "../../icons/sun";
import { SystemIcon } from "../../icons/system";
import { UnfoldVerticalIcon } from "../../icons/unfold-vertical";
import { type SelectOption } from "../../select";
import { websocketContext } from "../../websocket-provider/context";
import { Option } from "./option";

export const Settings = ({ isOverriden }: { isOverriden: boolean }) => {
    const { config, wsRequest, currentPath } = useContext(websocketContext);
    if (!config) return null;

    const overrides = config.overrides;

    const themeSelect: SelectOption[] = [
        {
            label: "System",
            icon: SystemIcon,
            value: "system",
        },
        {
            label: "Light",
            icon: SunIcon,
            value: "light",
        },
        {
            label: "Dark",
            icon: MoonIcon,
            value: "dark",
        },
    ];

    const detailsSelect: SelectOption[] = [
        {
            label: "open",
            icon: UnfoldVerticalIcon,
            iconClassName: "stroke-github-accent-fg",
            value: "open",
        },
        {
            label: "closed",
            icon: FoldVerticalIcon,
            value: "closed",
        },
    ];

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
            }}
            className={cn(
                "absolute left-14 top-[55px] z-20 w-96 p-2 text-sm",
                "rounded border border-github-border-default bg-github-canvas-subtle",
            )}
        >
            <p className="!mb-6">
                <strong>Temporarily</strong> override your settings.
                <br />
                To persist changes, update your{" "}
                <a
                    href="https://github.com/wallpants/github-preview.nvim#%EF%B8%8F-configuration"
                    target="_blank"
                    rel="noreferrer"
                >
                    neovim config files
                </a>
                .
            </p>
            <div className="grid grid-cols-3 gap-4">
                <Option
                    name="theme"
                    cKey="theme"
                    select={{
                        selected: themeSelect.find(
                            ({ value }) => config.overrides.theme === value,
                        )!,
                        options: themeSelect,
                        onChange: (selected) => {
                            wsRequest({
                                type: "update-config",
                                config: { theme: selected.value as Config["theme"] },
                            });
                        },
                    }}
                />
                <Option
                    name="<details>"
                    cKey="details_tags_open"
                    select={{
                        selected: detailsSelect.find(({ value }) =>
                            config.overrides.details_tags_open ? "open" : "closed" === value,
                        )!,
                        options: detailsSelect,
                        onChange: (selected) => {
                            wsRequest({
                                type: "update-config",
                                config: { details_tags_open: selected.value === "open" },
                            });
                        },
                    }}
                />
                <Option
                    name="single-file"
                    cKey="single_file"
                    toggle={{
                        value: overrides.single_file,
                        onChange: (enabled) => {
                            wsRequest({ type: "update-config", config: { single_file: enabled } });
                            if (currentPath) wsRequest({ type: "get-entry", path: currentPath });
                        },
                    }}
                    disabled={
                        config.dotfiles.single_file
                            ? "If app launched in single-file mode, it cannot be changed."
                            : undefined
                    }
                />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <Option
                    className="h-40"
                    name="cursorline"
                    cKey="cursor_line"
                    toggle={{
                        value: !overrides.cursor_line.disable,
                        onChange: (enabled) => {
                            wsRequest({
                                type: "update-config",
                                config: {
                                    cursor_line: { ...overrides.cursor_line, disable: !enabled },
                                },
                            });
                        },
                    }}
                    color={{
                        value: overrides.cursor_line.color,
                        onChange: (color) => {
                            wsRequest({
                                type: "update-config",
                                config: { cursor_line: { ...overrides.cursor_line, color } },
                            });
                        },
                    }}
                    range={{
                        value: overrides.cursor_line.opacity,
                        min: 0,
                        max: 1,
                        step: 0.1,
                        onChange: (opacity) => {
                            wsRequest({
                                type: "update-config",
                                config: {
                                    cursor_line: { ...overrides.cursor_line, opacity },
                                },
                            });
                        },
                    }}
                />
                <Option
                    className="h-40"
                    name="scroll"
                    cKey="scroll"
                    toggle={{
                        value: !overrides.scroll.disable,
                        onChange: (enabled) => {
                            wsRequest({
                                type: "update-config",
                                config: { scroll: { ...overrides.scroll, disable: !enabled } },
                            });
                        },
                    }}
                    range={{
                        value: overrides.scroll.top_offset_pct,
                        min: 0,
                        max: 100,
                        step: 1,
                        onChange: (top_offset_pct) => {
                            wsRequest({
                                type: "update-config",
                                config: {
                                    scroll: { ...overrides.scroll, top_offset_pct },
                                },
                            });
                        },
                    }}
                />
            </div>
            <button
                className={cn(
                    "float-right mb-2 mr-2 mt-4 text-orange-600 px-2 py-1 rounded-md",
                    "hover:bg-orange-600/10",
                    isOverriden ? "visible" : "invisible",
                )}
                onClick={() => {
                    wsRequest({ type: "update-config", config: config.dotfiles });
                }}
            >
                clear overrides
            </button>
        </div>
    );
};
