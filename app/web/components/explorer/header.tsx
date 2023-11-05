import { useContext, useEffect, useState } from "react";
import { useOnDocumentClick } from "../../use-on-document-click.ts";
import { cn, isEqual } from "../../utils.ts";
import { IconButton } from "../icon-button.tsx";
import { PanelCloseIcon } from "../icons/panel-close.tsx";
import { PanelOpenIcon } from "../icons/panel-open.tsx";
import { SettingsIcon } from "../icons/settings.tsx";
import { websocketContext } from "../websocket-provider/context.ts";
import { Settings } from "./settings/index.tsx";

export const Header = ({
    isExpanded,
    setIsExpanded,
    className,
}: {
    isExpanded: boolean;
    setIsExpanded: (e: boolean) => void;
    className: string;
}) => {
    const { config } = useContext(websocketContext);
    const [configOpen, setConfigOpen] = useState(false);
    const isOverriden = !isEqual(config?.dotfiles, config?.overrides);

    useOnDocumentClick({
        disabled: !configOpen,
        callback: () => {
            setConfigOpen(false);
        },
    });

    useEffect(() => {
        if (!configOpen) return;
        // setup listener to close menu on click anywhere
        const controller = new AbortController();

        document.addEventListener(
            "click",
            () => {
                setConfigOpen(false);
            },
            { signal: controller.signal },
        );

        return () => {
            controller.abort();
        };
    }, [configOpen]);

    return (
        <div
            className={cn(
                "flex items-center border-b border-github-border-default bg-github-canvas-default",
                isExpanded ? "px-4 justify-between h-14" : "justify-center flex-col-reverse",
                className,
            )}
        >
            {isExpanded && <h4 className="!my-0 mr-auto">Files</h4>}
            <div className="relative">
                <IconButton
                    buttonClassName={cn(isExpanded ? "ml-4" : "my-2")}
                    noBorder={!isExpanded}
                    Icon={SettingsIcon}
                    onClick={(e) => {
                        e.stopPropagation();
                        setConfigOpen(!configOpen);
                    }}
                />
                {isOverriden ? (
                    <div className="absolute right-1 top-3 h-2 w-2 rounded-full bg-orange-600" />
                ) : null}
            </div>
            <IconButton
                buttonClassName={cn(isExpanded ? "ml-4" : "my-2")}
                noBorder={!isExpanded}
                Icon={isExpanded ? PanelOpenIcon : PanelCloseIcon}
                onClick={() => {
                    setIsExpanded(!isExpanded);
                }}
            />
            {configOpen ? <Settings isOverriden={isOverriden} /> : null}
        </div>
    );
};
