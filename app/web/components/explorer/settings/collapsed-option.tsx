import {
    useContext,
    useEffect,
    useState,
    type Dispatch,
    type FC,
    type SetStateAction,
} from "react";
import { type Config } from "../../../../types";
import { cn, isEqual } from "../../../utils";
import { FillingCircle } from "../../filling-circle";
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
    startExit: boolean;
};

const DURATION_SECS = 2.5;

export const CollapsedOption = ({
    cKey,
    active,
    setConfigOpen,
    setSettingsOffset,
    className,
    startExit,
}: Props) => {
    const { config } = useContext(websocketContext);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (!active || !startExit || isHovering) return;
        const timeout = setTimeout(() => {
            setConfigOpen(null);
        }, DURATION_SECS * 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [startExit, setConfigOpen, active, isHovering]);

    if (!config) return null;

    const dotfiles = config.dotfiles[cKey];
    const override = config.overrides[cKey];
    const isOverriden = !isEqual(dotfiles, override);

    const [Icon, iconClassName] = findIcon(cKey, config.overrides);

    return (
        <div className={cn("relative mx-auto", className)}>
            {Icon && (
                <div className="relative overflow-hidden rounded-md">
                    <FillingCircle
                        className="absolute left-1/2 top-1/2 -z-10 size-14 -translate-x-1/2 -translate-y-1/2"
                        animate={startExit && active && !isHovering}
                        background="var(--color-canvas-default)"
                        fillBackground="var(--color-canvas-subtle)"
                        durationSecs={DURATION_SECS}
                    />
                    <IconButton
                        Icon={Icon}
                        onMouseEnter={() => {
                            setIsHovering(true);
                        }}
                        onMouseLeave={() => {
                            setIsHovering(false);
                        }}
                        className={cn("mx-auto", active && !startExit && "bg-github-canvas-subtle")}
                        iconClassName={iconClassName}
                        noBorder
                        onClick={(event) => {
                            event.stopPropagation();
                            const element = event.currentTarget;
                            setSettingsOffset(element.getBoundingClientRect().y);
                            setConfigOpen((c) => (c === cKey ? null : cKey));
                        }}
                    />
                </div>
            )}
            {isOverriden ? (
                <div className="absolute right-1 top-1 size-2 rounded-full bg-orange-600" />
            ) : null}
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
        if (config[cKey]) return [PinIcon, "stroke-github-danger-fg fill-github-danger-fg"];
        return [PinOffIcon, ""];
    }

    if (cKey === "cursor_line") {
        if (config[cKey].disable) return [CursorlineIcon, ""];
        return [CursorlineIcon, "stroke-[#ff00a2]"];
    }

    if (cKey === "details_tags_open") {
        if (config[cKey]) return [UnfoldVerticalIcon, "stroke-github-success-fg"];
        return [FoldVerticalIcon, ""];
    }

    return [null, ""];
}
