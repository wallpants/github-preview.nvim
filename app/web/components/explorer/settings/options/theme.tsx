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

    return <Option name="theme" cKey="theme" select={themeSelect} />;
};
