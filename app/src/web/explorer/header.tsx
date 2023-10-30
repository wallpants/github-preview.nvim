import { IconButton } from "../icon-button.tsx";
import { cn } from "../utils.ts";
import { PanelCloseIcon } from "./icons/panel-close.tsx";
import { PanelOpenIcon } from "./icons/panel-open.tsx";
// import { SettingsIcon } from "./icons/settings.tsx";

export const Header = ({
    isExpanded,
    setIsExpanded,
    className,
}: {
    isExpanded: boolean;
    setIsExpanded: (e: boolean) => void;
    className: string;
}) => (
    <div
        className={cn(
            "flex items-center border-b border-github-border-default bg-github-canvas-default",
            isExpanded ? "px-4 justify-between h-14" : "justify-center flex-col-reverse",
            className,
        )}
    >
        {isExpanded && <h4 className="!my-0">Files</h4>}
        {/* <IconButton */}
        {/*     className={cn(isExpanded ? "ml-4" : "my-2")} */}
        {/*     noBorder={!isExpanded} */}
        {/*     Icon={SettingsIcon} */}
        {/*     onClick={() => { */}
        {/*         console.log("open settings"); */}
        {/*     }} */}
        {/* /> */}
        <IconButton
            className={cn(isExpanded ? "ml-4" : "my-2")}
            noBorder={!isExpanded}
            Icon={isExpanded ? PanelOpenIcon : PanelCloseIcon}
            onClick={() => {
                setIsExpanded(!isExpanded);
            }}
        />
    </div>
);
