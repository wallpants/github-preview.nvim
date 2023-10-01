import { useContext, useState } from "react";
import { cn } from "../../utils.ts";
import { websocketContext } from "../../websocket-context/context.ts";
import { IconButton } from "../icon-button.tsx";
import { ThemePicker } from "../theme-picker/index.tsx";
import { EntryComponent } from "./entry.tsx";
import { PanelCloseIcon } from "./icons/panel-close.tsx";
import { PanelOpenIcon } from "./icons/panel-open.tsx";

export const Explorer = () => {
    const { currentPath } = useContext(websocketContext);
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-r-md border border-l-0 border-github-border-default",
                isExpanded ? "w-80" : "w-12",
            )}
        >
            <div
                className={cn(
                    "flex h-14 items-center border-b border-github-border-default",
                    isExpanded ? "px-4 justify-between" : "justify-center",
                )}
            >
                {isExpanded && <h4 className="!my-0">Files</h4>}
                <IconButton
                    className={cn(isExpanded && "ml-4")}
                    noBorder={!isExpanded}
                    Icon={isExpanded ? PanelOpenIcon : PanelCloseIcon}
                    onClick={() => {
                        setIsExpanded(!isExpanded);
                    }}
                />
            </div>
            <div className={isExpanded ? "block h-full overflow-auto pb-56 pt-1" : "hidden"}>
                <EntryComponent entry="" depth={-1} currentPath={currentPath} />
            </div>
            <div
                className={cn(
                    "absolute bottom-0 flex h-14 inset-x-0 items-center justify-center",
                    "border-t border-github-border-default bg-github-canvas-default",
                )}
            >
                {isExpanded && (
                    <p className="!mb-0 mr-4 text-center text-sm">with ♥️ by wallpants.io</p>
                )}
                <ThemePicker noBorder={!isExpanded} />
            </div>
        </div>
    );
};
