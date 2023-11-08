import { useContext, useState } from "react";
import { type Config } from "../../../../types";
import { cn } from "../../../utils";
import { FoldVerticalIcon } from "../../icons/fold-vertical";
import { MoonIcon } from "../../icons/moon";
import { SunIcon } from "../../icons/sun";
import { SystemIcon } from "../../icons/system";
import { UnfoldVerticalIcon } from "../../icons/unfold-vertical";
import { websocketContext } from "../../websocket-provider/context";
import { Option } from "./option";
import { type SelectOption } from "./select";

export const Settings = ({
    isOverriden,
    cKey,
    settingsOffset,
}: {
    isOverriden: boolean;
    cKey: keyof Config | "no-key";
    settingsOffset: number;
}) => {
    const { config, wsRequest } = useContext(websocketContext);
    const [tick, setTick] = useState(0);

    if (!config) return null;
    const overrides = config.overrides;

    const detailsSelect: SelectOption[] = [
        {
            label: "open",
            icon: UnfoldVerticalIcon,
            iconClassName: "stroke-github-accent-fg",
            selected: overrides.details_tags_open,
            onClick: () => {
                wsRequest({ type: "update_config", action: ["details_tags", "open"] });
            },
        },
        {
            label: "close",
            icon: FoldVerticalIcon,
            selected: !overrides.details_tags_open,
            onClick: () => {
                wsRequest({ type: "update_config", action: ["details_tags", "closed"] });
            },
        },
    ];

    const themeSelect: SelectOption[] = [
        {
            label: "System",
            icon: SystemIcon,
            selected: overrides.theme === "system",
            onClick: () => {
                wsRequest({ type: "update_config", action: ["set_theme", "system"] });
            },
        },
        {
            label: "Light",
            icon: SunIcon,
            selected: overrides.theme === "light",
            onClick: () => {
                wsRequest({ type: "update_config", action: ["set_theme", "light"] });
            },
        },
        {
            label: "Dark",
            icon: MoonIcon,
            selected: overrides.theme === "dark",
            onClick: () => {
                wsRequest({ type: "update_config", action: ["set_theme", "dark"] });
            },
        },
    ];

    const noKey = cKey === "no-key";

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                // a little bit of a hack to close "select" dropdowns.
                // "select" arrays above are recreated on every render, triggering
                // a rerender on components that rely on them and thus closing menus
                setTick(tick + 1);
            }}
            style={{ top: settingsOffset - 50 }}
            className={cn(
                "absolute left-14 top-[55px] z-20 p-2 text-sm",
                "rounded border border-github-border-default bg-github-canvas-subtle",
                noKey && "w-[430px]",
            )}
        >
            {noKey && (
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
            )}
            <div className={cn(noKey ? "grid grid-cols-3 gap-4 mb-4" : "flex justify-center")}>
                {(noKey || cKey === "theme") && (
                    <Option name="theme" cKey="theme" select={themeSelect} />
                )}
                {(noKey || cKey === "details_tags_open") && (
                    <Option name="<details>" cKey="details_tags_open" select={detailsSelect} />
                )}
                {(noKey || cKey === "single_file") && (
                    <Option
                        name="single-file"
                        cKey="single_file"
                        toggle={{
                            value: overrides.single_file,
                            onChange: () => {
                                wsRequest({
                                    type: "update_config",
                                    action: ["single_file", "toggle"],
                                });
                            },
                        }}
                        disabled={
                            config.dotfiles.single_file
                                ? "If plugin launched in single-file mode, it cannot be changed."
                                : undefined
                        }
                    />
                )}
            </div>

            <div className={cn(noKey ? "grid grid-cols-2 gap-4" : "flex justify-center")}>
                {(noKey || cKey === "cursor_line") && (
                    <Option
                        className="h-40"
                        name="cursorline"
                        cKey="cursor_line"
                        toggle={{
                            value: !overrides.cursor_line.disable,
                            onChange: () => {
                                wsRequest({
                                    type: "update_config",
                                    action: ["cursorline", "toggle"],
                                });
                            },
                        }}
                        color={{
                            value: overrides.cursor_line.color,
                            onChange: (color) => {
                                wsRequest({
                                    type: "update_config",
                                    action: ["cursorline.color", color],
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
                                    action: ["cursorline.opacity", opacity],
                                });
                            },
                        }}
                    />
                )}
                {(noKey || cKey === "scroll") && (
                    <Option
                        className="h-40"
                        name="scroll"
                        cKey="scroll"
                        toggle={{
                            value: !overrides.scroll.disable,
                            onChange: () => {
                                wsRequest({
                                    type: "update_config",
                                    action: ["scroll", "toggle"],
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
                                    action: ["scroll.offset", top_offset_pct],
                                });
                            },
                        }}
                    />
                )}
            </div>
            {noKey && (
                <button
                    className={cn(
                        "float-right mb-2 mr-2 mt-4 text-orange-600 px-2 py-1 rounded-md",
                        "hover:bg-orange-600/10",
                        isOverriden ? "visible" : "invisible",
                    )}
                    onClick={() => {
                        wsRequest({ type: "update_config", action: ["clear_overrides"] });
                    }}
                >
                    clear overrides
                </button>
            )}
        </div>
    );
};
