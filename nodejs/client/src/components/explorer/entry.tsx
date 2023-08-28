import { useContext } from "react";
import { type Entry } from "../../../../types";
import { cn } from "../../lib/styles";
import { websocketContext } from "../../websocket-context/context";
import { DirIcon } from "./dir-icon";
import { FileIcon } from "./file-icon";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
    dir: <DirIcon className={iconClassName} />,
    file: <FileIcon className={iconClassName} />,
};

export const EntryComponent = ({ type, relativeToRoot }: Entry) => {
    const { wsSend } = useContext(websocketContext);

    function requestEntries() {
        wsSend({ currentBrowserEntry: { relativeToRoot, type } });
    }

    const name = relativeToRoot.split("/").pop();

    return (
        <div
            onClick={requestEntries}
            className={cn(
                "group flex h-[38px] cursor-pointer items-center border-t px-4 first:border-t-0",
                "border-github-border-default hover:bg-github-canvas-subtle",
            )}
        >
            {IconMap[type]}
            <span className="text-sm group-hover:text-github-accent-fg group-hover:underline">
                {name}
            </span>
        </div>
    );
};
