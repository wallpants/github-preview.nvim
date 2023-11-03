import { useContext, useState, type FC } from "react";
import { type Config } from "../../../../types.ts";
import { useOnDocumentClick } from "../../../use-on-document-click.ts";
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

    useOnDocumentClick({
        disabled: !isOpen,
        callback: () => {
            setIsOpen(false);
        },
    });

    return (
        <div className="relative z-20">
            <IconButton
                noBorder={!isOpen}
                Icon={iconsMap[theme]}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            />
            {isOpen && (
                <div className="absolute left-[102%] top-0 flex space-x-[1%]">
                    {Object.keys(iconsMap)
                        .filter((t) => t !== theme)
                        .map((theme) => (
                            <IconButton
                                key={theme}
                                className="bg-github-canvas-default"
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
