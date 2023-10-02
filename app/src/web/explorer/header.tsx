import { IconButton } from "../icon-button.tsx";
import { cn } from "../utils.ts";
import { PanelCloseIcon } from "./icons/panel-close.tsx";
import { PanelOpenIcon } from "./icons/panel-open.tsx";

export const Header = ({
    isExpanded,
    setIsExpanded,
}: {
    isExpanded: boolean;
    setIsExpanded: (e: boolean) => void;
}) => (
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
);
