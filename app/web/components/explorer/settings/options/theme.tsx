import { useContext } from "react";
import { MoonIcon } from "../../../icons/moon";
import { SunIcon } from "../../../icons/sun";
import { SystemIcon } from "../../../icons/system";
import { websocketContext } from "../../../websocket-provider/context";
import { Option } from "../option";
import { type SelectOption } from "../select";

export const ThemeOption = () => {
    const { wsRequest, config } = useContext(websocketContext);

    if (!config) return null;
    const { overrides } = config;

    const themeSelect: SelectOption[] = [
        {
            label: "System",
            icon: SystemIcon,
            selected: overrides.theme.name === "system",
            onClick: () => {
                wsRequest({ type: "update_config", action: ["theme_name", "system"] });
            },
        },
        {
            label: "Light",
            icon: SunIcon,
            selected: overrides.theme.name === "light",
            onClick: () => {
                wsRequest({ type: "update_config", action: ["theme_name", "light"] });
            },
        },
        {
            label: "Dark",
            icon: MoonIcon,
            selected: overrides.theme.name === "dark",
            onClick: () => {
                wsRequest({ type: "update_config", action: ["theme_name", "dark"] });
            },
        },
    ];

    return (
        <Option
            className="h-36"
            name="theme"
            cKey="theme"
            toggle={{
                value: overrides.theme.high_contrast,
                onChange: () => {
                    wsRequest({
                        type: "update_config",
                        action: [
                            "theme_high_contrast",
                            overrides.theme.high_contrast ? "off" : "on",
                        ],
                    });
                },
            }}
            select={themeSelect}
        />
    );
};
