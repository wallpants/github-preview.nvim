import { useContext, type Dispatch, type SetStateAction } from "react";
import { type Config } from "../../../types.ts";
import { cn } from "../../utils.ts";
import { IconButton } from "../icon-button.tsx";
import { PanelCloseIcon } from "../icons/panel-close.tsx";
import { PanelOpenIcon } from "../icons/panel-open.tsx";
import { SettingsIcon } from "../icons/settings.tsx";
import { websocketContext } from "../websocket-provider/context.ts";

export const Header = ({
    isExpanded,
    setIsExpanded,
    setConfigOpen,
    className,
    isOverriden,
    setSettingsOffset,
}: {
    isExpanded: boolean;
    setIsExpanded: (e: boolean) => void;
    setConfigOpen: Dispatch<SetStateAction<null | keyof Config | "no-key">>;
    className: string;
    isOverriden: boolean;
    setSettingsOffset: (o: number) => void;
}) => {
    const { refObject } = useContext(websocketContext);

    return (
        <div
            className={cn(
                "flex items-center border-b border-github-border-default bg-github-canvas-default",
                isExpanded ? "px-4 justify-between h-14" : "justify-center flex-col-reverse",
                className,
            )}
        >
            {isExpanded && (
                <>
                    <h4 className="!my-0 mr-auto">Files</h4>
                    <div className="relative">
                        <IconButton
                            className="ml-4"
                            noBorder={!isExpanded}
                            Icon={SettingsIcon}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSettingsOffset(105);
                                setConfigOpen((c) => (c === "no-key" ? null : "no-key"));
                            }}
                        />
                        {isOverriden ? (
                            <div className="absolute right-1 top-3 h-2 w-2 rounded-full bg-orange-600" />
                        ) : null}
                    </div>
                </>
            )}
            <IconButton
                className={cn(isExpanded ? "ml-4" : "my-2")}
                noBorder={!isExpanded}
                Icon={isExpanded ? PanelOpenIcon : PanelCloseIcon}
                onClick={() => {
                    refObject.current.skipScroll = true;
                    setIsExpanded(!isExpanded);
                }}
            />
        </div>
    );
};
