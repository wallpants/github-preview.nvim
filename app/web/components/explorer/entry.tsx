import { useContext, useEffect, useMemo, useState } from "react";
import { cn, getSegments } from "../../utils.ts";
import { ChevronRight } from "../icons/chevron-right.tsx";
import { DirIcon } from "../icons/dir.tsx";
import { FileIcon } from "../icons/file.tsx";
import { OpenDirIcon } from "../icons/open-dir.tsx";
import { websocketContext } from "../websocket-provider/context.ts";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
    dir: <DirIcon className={iconClassName} />,
    openDir: <OpenDirIcon className={iconClassName} />,
    file: <FileIcon className={iconClassName} />,
};

type Props = {
    path: string;
    depth: number;
    currentPath: string | undefined;
};

export const EntryComponent = ({ path, depth, currentPath }: Props) => {
    const { isConnected, registerHandler, wsRequest } = useContext(websocketContext);
    const [entries, setEntries] = useState<string[]>([]);
    const [isSelected, setIsSelected] = useState(false);
    const [expanded, setExpanded] = useState(
        // expand root by default ("" is root)
        path === "",
    );

    const isDir = path === "" || path.endsWith("/");

    const entryName = useMemo(() => {
        const segments = getSegments(path);
        let name = segments.pop();
        if (isDir) name = segments.pop();
        return name;
    }, [isDir, path]);

    useEffect(() => {
        registerHandler(`explorer-${path}`, (message) => {
            if (message.type === "entries" && message.path === path) {
                setEntries(message.entries);
            }
        });
    }, [path, registerHandler]);

    useEffect(() => {
        if (!isConnected || !isDir) return;
        wsRequest({ type: "get-entries", path: path });
    }, [wsRequest, path, isConnected, isDir]);

    useEffect(() => {
        const segments = getSegments(currentPath);
        let entrySlice = segments.slice(0, depth + 1).join("/");

        if (isDir) {
            entrySlice += "/";
            if (entrySlice === path) setExpanded(true);
        }

        setIsSelected(currentPath === path);
    }, [currentPath, depth, path, isDir]);

    return (
        <div>
            {entryName && (
                <div
                    onClick={() => {
                        setExpanded(true);
                        wsRequest({ type: "get-entry", path });
                    }}
                    style={{ paddingLeft: depth * 11 + (isDir ? 0 : 20) }}
                    className={cn(
                        "relative group flex h-[34px] cursor-pointer items-center mx-3 rounded-md",
                        "border-github-border-default hover:bg-github-canvas-subtle",
                        isSelected && "bg-github-canvas-subtle",
                    )}
                >
                    {isSelected && (
                        <div className="absolute -left-2 h-6 w-1.5 rounded-sm bg-github-accent-fg" />
                    )}
                    {isDir && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }}
                            // eslint-disable-next-line
                            className="hover:bg-github-border-default mr-1 flex h-full items-center"
                        >
                            <ChevronRight className={cn(expanded && "rotate-90")} />
                        </div>
                    )}
                    {IconMap[isDir ? (expanded ? "openDir" : "dir") : "file"]}
                    <span className="text-sm group-hover:text-github-accent-fg group-hover:underline">
                        {entryName}
                    </span>
                </div>
            )}
            {expanded &&
                entries.map((path) => (
                    <EntryComponent
                        key={path}
                        path={path}
                        depth={depth + 1}
                        currentPath={currentPath}
                    />
                ))}
        </div>
    );
};
