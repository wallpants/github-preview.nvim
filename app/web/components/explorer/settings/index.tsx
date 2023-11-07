import { useContext, useState } from "react";
import { cn } from "../../../utils";
import { FoldVerticalIcon } from "../../icons/fold-vertical";
import { MoonIcon } from "../../icons/moon";
import { SunIcon } from "../../icons/sun";
import { SystemIcon } from "../../icons/system";
import { UnfoldVerticalIcon } from "../../icons/unfold-vertical";
import { websocketContext } from "../../websocket-provider/context";
import { Option } from "./option";
import { type SelectOption } from "./select";

export const Settings = ({ isOverriden }: { isOverriden: boolean }) => {
    const { currentPath, config, wsRequest } = useContext(websocketContext);
    const [tick, setTick] = useState(0);

    if (!config) return null;

    const overrides = config.overrides;

    const themeSelect: SelectOption[] = [
        {
            label: "System",
            icon: SystemIcon,
            selected: overrides.theme === "system",
            onClick: () => {
                wsRequest({ type: "update_config", config: { theme: "system" } });
                if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
            },
        },
        {
            label: "Light",
            icon: SunIcon,
            selected: overrides.theme === "light",
            onClick: () => {
                wsRequest({ type: "update_config", config: { theme: "light" } });
                if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
            },
        },
        {
            label: "Dark",
            icon: MoonIcon,
            selected: overrides.theme === "dark",
            onClick: () => {
                wsRequest({ type: "update_config", config: { theme: "dark" } });
                if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
            },
        },
    ];

    const detailsSelect: SelectOption[] = [
        {
            label: "open",
            icon: UnfoldVerticalIcon,
            iconClassName: "stroke-github-accent-fg",
            selected: overrides.details_tags_open,
            onClick: () => {
                wsRequest({ type: "update_config", config: { details_tags_open: true } });
                if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
            },
        },
        {
            label: "close",
            icon: FoldVerticalIcon,
            selected: !overrides.details_tags_open,
            onClick: () => {
                wsRequest({ type: "update_config", config: { details_tags_open: false } });
                if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
            },
        },
    ];

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                // a little bit of a hack to close "select" dropdowns.
                // "select" arrays above are recreated on every render, triggering
                // a rerender on components that rely on them and thus closing menus
                setTick(tick + 1);
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
                    href="https://github.com/wallpants/github-preview.nvim#%EF%B8%8F-setup"
                    target="_blank"
                    rel="noreferrer"
                >
                    neovim config files
                </a>
                .
            </p>
            <div className="grid grid-cols-3 gap-4">
                <Option name="theme" cKey="theme" select={themeSelect} />
                <Option name="<details>" cKey="details_tags_open" select={detailsSelect} />
                <Option
                    name="single-file"
                    cKey="single_file"
                    toggle={{
                        value: overrides.single_file,
                        onChange: (enabled) => {
                            wsRequest({ type: "update_config", config: { single_file: enabled } });
                            if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
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
                                type: "update_config",
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
                                type: "update_config",
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
                                type: "update_config",
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
                                type: "update_config",
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
                                type: "update_config",
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
                    wsRequest({ type: "update_config", config: config.dotfiles });
                }}
            >
                clear overrides
            </button>
        </div>
    );
};
