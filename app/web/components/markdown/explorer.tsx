import { useContext } from "react";
import { cn, getEntryName, getSegments } from "../../utils";
import { DirIcon } from "../icons/dir";
import { FileIcon } from "../icons/file";
import { OpenDirIcon } from "../icons/open-dir";
import { websocketContext, type WebsocketContext } from "../websocket-provider/context";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
    dir: <DirIcon className={iconClassName} />,
    openDir: <OpenDirIcon className={iconClassName} />,
    file: <FileIcon className={iconClassName} />,
};

const Entry = ({
    isParent,
    path,
    wsRequest,
}: {
    isParent?: boolean;
    path: string;
    wsRequest: WebsocketContext["wsRequest"];
}) => (
    <div
        key={path}
        onClick={() => {
            wsRequest({ type: "get_entry", path });
        }}
        className={cn(
            "group flex h-[34px] cursor-pointer items-center px-3 rounded-md",
            "hover:bg-github-canvas-subtle",
        )}
    >
        {IconMap[path.endsWith("/") || isParent ? "dir" : "file"]}
        <span className="text-sm group-hover:text-github-accent-fg group-hover:underline">
            {isParent ? ".." : getEntryName(path)}
        </span>
    </div>
);

export const Explorer = () => {
    const { currentEntries, currentPath, wsRequest } = useContext(websocketContext);

    const segments = getSegments(currentPath);
    if (!currentEntries) return null;

    // path must be empty string "" to request root
    let parent = "";
    if (segments.length) {
        // if we're one level deep "repo-root/dir1/" currentPath is "dir1/"
        // which means segments is ["dir", "/"]
        // the parent when one level deep is root. so `parent` should stay empty string ""

        if (segments.length > 2) {
            parent = segments.slice(0, -2).join("/");
            // path must end with "/" to indicate it's a dir
            parent += "/";
        }
    }

    return (
        <div className="mx-auto mt-20 w-[80%] rounded-md border-2 border-github-border-default">
            {segments.length ? <Entry isParent path={parent} wsRequest={wsRequest} /> : null}
            {currentEntries.map((path) => (
                <Entry key={path} path={path} wsRequest={wsRequest} />
            ))}
        </div>
    );
};
