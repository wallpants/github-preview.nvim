import { useContext } from "react";
import { type Entry } from "../../../../types";
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
        <div className="group flex h-[38px] items-center border-t border-github-border-default px-4 first:border-t-0 hover:bg-github-canvas-subtle">
            {IconMap[type]}
            <span
                onClick={requestEntries}
                className="cursor-pointer text-sm !text-github-fg-default hover:!text-github-accent-fg hover:underline"
            >
                {name}
            </span>
        </div>
    );
};
