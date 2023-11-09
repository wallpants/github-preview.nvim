import { useContext, type Dispatch, type FC, type SetStateAction } from "react";
import { type Config } from "../../../../types";
import { cn, isEqual } from "../../../utils";
import { IconButton } from "../../icon-button";
import { CursorlineIcon } from "../../icons/cursorline";
import { FoldVerticalIcon } from "../../icons/fold-vertical";
import { MoonIcon } from "../../icons/moon";
import { MouseIcon } from "../../icons/mouse";
import { PinIcon } from "../../icons/pin";
import { PinOffIcon } from "../../icons/pin-off";
import { SunIcon } from "../../icons/sun";
import { SystemIcon } from "../../icons/system";
import { UnfoldVerticalIcon } from "../../icons/unfold-vertical";
import { websocketContext } from "../../websocket-provider/context";

type Props = {
    cKey: keyof Config;
    active: boolean;
    setConfigOpen: Dispatch<SetStateAction<null | keyof Config | "no-key">>;
    setSettingsOffset: (o: number) => void;
    className?: string;
};

export const CollapsedOption = ({
    cKey,
    active,
    setConfigOpen,
    setSettingsOffset,
    className,
}: Props) => {
    const { config } = useContext(websocketContext);

    if (!config) return null;

    const dotfiles = config.dotfiles[cKey];
    const override = config.overrides[cKey];
    const isOverriden = !isEqual(dotfiles, override);

    const [Icon, iconClassName] = findIcon(cKey, config.overrides);

    return (
        <div className={cn("relative mx-auto", className)}>
            {isOverriden ? (
                <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-600" />
            ) : null}
            {Icon && (
                <IconButton
                    Icon={Icon}
                    className={cn("mx-auto", active && "bg-github-canvas-subtle")}
                    iconClassName={iconClassName}
                    noBorder
                    onClick={(event) => {
                        event.stopPropagation();
                        const element = event.currentTarget;
                        setSettingsOffset(element.getBoundingClientRect().y);
                        setConfigOpen((c) => (c === cKey ? null : cKey));
                    }}
                />
            )}
        </div>
    );
};

function findIcon(
    cKey: Props["cKey"],
    config: Config,
): [Icon: FC<{ className: string }> | null, className: string] {
    if (cKey === "theme") {
        if (config[cKey].name === "dark") return [MoonIcon, ""];
        if (config[cKey].name === "light") return [SunIcon, ""];
        return [SystemIcon, ""];
    }

    if (cKey === "scroll") {
        if (config[cKey].disable) return [MouseIcon, ""];
        return [MouseIcon, "stroke-github-accent-fg"];
    }

    if (cKey === "single_file") {
        if (config[cKey]) return [PinIcon, "stroke-red-600 fill-red-600"];
        return [PinOffIcon, ""];
    }

    if (cKey === "cursor_line") {
        if (config[cKey].disable) return [CursorlineIcon, ""];
        return [CursorlineIcon, "stroke-[#ff00a2]"];
    }

    if (cKey === "details_tags_open") {
        if (config[cKey]) return [UnfoldVerticalIcon, "stroke-green-600"];
        return [FoldVerticalIcon, ""];
    }

    return [null, ""];
}
