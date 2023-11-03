import { useContext, useState, type FC } from "react";
import { type Config } from "../../../../types.ts";
import { IconButton } from "../../icon-button.tsx";
import { MoonIcon } from "../../icons/moon.tsx";
import { SunIcon } from "../../icons/sun.tsx";
import { SystemIcon } from "../../icons/system.tsx";
import { websocketContext } from "../../websocket-provider/context.ts";

const iconsMap: Record<Config["theme"], FC<{ className: string }>> = {
    system: SystemIcon,
    light: SunIcon,
    dark: MoonIcon,
};

export function ThemePicker() {
    const { config, wsRequest } = useContext(websocketContext);
    const [isOpen, setIsOpen] = useState(false);

    const theme = config?.overrides.theme ?? "system";

    return (
        <div className="relative z-20 flex flex-col items-center">
            <IconButton
                Icon={iconsMap[theme]}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            />
            {isOpen && (
                <div className="absolute top-0 flex flex-col">
                    {Object.keys(iconsMap)
                        .sort((t) => (t === theme ? -1 : 1))
                        .map((theme) => (
                            <IconButton
                                key={theme}
                                className="mb-0.5 bg-github-canvas-default"
                                Icon={iconsMap[theme as Config["theme"]]}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(!isOpen);
                                    wsRequest({
                                        type: "update-config",
                                        config: {
                                            theme: theme as Config["theme"],
                                        },
                                    });
                                }}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
