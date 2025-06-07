import { useContext } from "react";
import { cn, getEntryName, getSegments } from "../../utils";
import { DirIcon } from "../icons/dir";
import { FileIcon } from "../icons/file";
import { websocketContext, type WebsocketContext } from "../websocket-provider/context";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
    dir: <DirIcon className={iconClassName} />,
    file: <FileIcon className={iconClassName} />,
};

const Entry = ({
    path,
    isParent,
    wsRequest,
    single_file,
}: {
    path: string;
    isParent?: boolean;
    wsRequest: WebsocketContext["wsRequest"];
    single_file: boolean | undefined;
}) => (
    <div
        key={path}
        onClick={() => {
            wsRequest({ type: "get_entry", path });
        }}
        style={{ color: single_file ? "purple" : undefined }}
        className={cn(
            "group flex h-[38px] cursor-pointer items-center px-3 rounded-md hover:bg-github-canvas-subtle",
            single_file && "cursor-not-allowed",
        )}
    >
        {IconMap[path.endsWith("/") || isParent ? "dir" : "file"]}
        <span className="group-hover:text-github-accent-fg text-sm group-hover:underline">
            {isParent ? ".." : getEntryName(path)}
        </span>
    </div>
);

export const Explorer = () => {
    const { currentPath, refObject, config, wsRequest } = useContext(websocketContext);

    if (!refObject.current.currentEntries || !currentPath) return null;
    const segments = getSegments(currentPath);

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

    const single_file = config?.overrides.single_file;

    return (
        <div className="border-github-border-default mx-auto mt-20 w-4/5 rounded-md border-2">
            {segments.length ? (
                <Entry isParent path={parent} wsRequest={wsRequest} single_file={single_file} />
            ) : null}
            {refObject.current.currentEntries.map((path) => (
                <Entry key={path} path={path} wsRequest={wsRequest} single_file={single_file} />
            ))}
        </div>
    );
};
