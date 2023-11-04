import { useContext } from "react";
import { cn } from "../../../utils";
import { CheckSquareIcon } from "../../icons/check-square";
import { FoldVerticalIcon } from "../../icons/fold-vertical";
import { MoonIcon } from "../../icons/moon";
import { SquareIcon } from "../../icons/square";
import { SunIcon } from "../../icons/sun";
import { SystemIcon } from "../../icons/system";
import { UnfoldVerticalIcon } from "../../icons/unfold-vertical";
import { websocketContext } from "../../websocket-provider/context";
import { Option } from "./option";
import { type SelectOption } from "./select";

export const Config = ({ isOverriden }: { isOverriden: boolean }) => {
    const { config, wsRequest } = useContext(websocketContext);
    if (!config) return null;

    const overrides = config.overrides;

    const themeSelect: SelectOption[] = [
        {
            label: "System",
            icon: SystemIcon,
            selected: overrides.theme === "system",
            onClick: () => {
                wsRequest({ type: "update-config", config: { theme: "system" } });
            },
        },
        {
            label: "Light",
            icon: SunIcon,
            selected: overrides.theme === "light",
            onClick: () => {
                wsRequest({ type: "update-config", config: { theme: "light" } });
            },
        },
        {
            label: "Dark",
            icon: MoonIcon,
            selected: overrides.theme === "dark",
            onClick: () => {
                wsRequest({ type: "update-config", config: { theme: "dark" } });
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
                wsRequest({ type: "update-config", config: { details_tags_open: true } });
            },
        },
        {
            label: "close",
            icon: FoldVerticalIcon,
            selected: !overrides.details_tags_open,
            onClick: () => {
                wsRequest({ type: "update-config", config: { details_tags_open: false } });
            },
        },
    ];

    const singleFileSelect: SelectOption[] = [
        {
            label: "true",
            icon: CheckSquareIcon,
            iconClassName: "stroke-green-600",
            selected: overrides.single_file,
            onClick: () => {
                wsRequest({ type: "update-config", config: { single_file: true } });
            },
        },
        {
            label: "false",
            icon: SquareIcon,
            selected: !overrides.single_file,
            onClick: () => {
                wsRequest({ type: "update-config", config: { single_file: false } });
            },
        },
    ];

    const cursorLineSelect: SelectOption[] = [
        {
            label: "enabled",
            icon: CheckSquareIcon,
            iconClassName: "stroke-green-600",
            selected: !overrides.cursor_line.disable,
            onClick: () => {
                wsRequest({
                    type: "update-config",
                    config: { cursor_line: { ...overrides.cursor_line, disable: false } },
                });
            },
        },
        {
            label: "disabled",
            icon: SquareIcon,
            selected: overrides.cursor_line.disable,
            onClick: () => {
                wsRequest({
                    type: "update-config",
                    config: { cursor_line: { ...overrides.cursor_line, disable: true } },
                });
            },
        },
    ];

    const scrollSelect: SelectOption[] = [
        {
            label: "enabled",
            icon: CheckSquareIcon,
            iconClassName: "stroke-green-600",
            selected: !overrides.scroll.disable,
            onClick: () => {
                wsRequest({
                    type: "update-config",
                    config: { scroll: { ...overrides.scroll, disable: false } },
                });
            },
        },
        {
            label: "disabled",
            icon: SquareIcon,
            selected: overrides.scroll.disable,
            onClick: () => {
                wsRequest({
                    type: "update-config",
                    config: { scroll: { ...overrides.scroll, disable: true } },
                });
            },
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
                    href="https://github.com/wallpants/github-preview.nvim#setup"
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
                    select={singleFileSelect}
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
                    select={cursorLineSelect}
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
                    select={scrollSelect}
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
