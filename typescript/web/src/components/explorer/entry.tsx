import { useContext, useEffect, useMemo, useState } from "react";
import { cn, getSegments } from "../../utils.ts";
import { websocketContext } from "../../websocket-context/context.ts";
import { ChevronRight } from "./icons/chevron-right.tsx";
import { DirIcon } from "./icons/dir.tsx";
import { FileIcon } from "./icons/file.tsx";
import { OpenDirIcon } from "./icons/open-dir.tsx";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
    dir: <DirIcon className={iconClassName} />,
    openDir: <OpenDirIcon className={iconClassName} />,
    file: <FileIcon className={iconClassName} />,
};

type Props = {
    entry: string;
    depth: number;
    currentPath: string | undefined;
};

export const EntryComponent = ({ entry, depth, currentPath }: Props) => {
    const { isConnected, registerHandler, getEntries, navigate } = useContext(websocketContext);
    const [entries, setEntries] = useState<string[]>([]);
    const [isSelected, setIsSelected] = useState(false);
    const [expanded, setExpanded] = useState(
        // expand root by default ("" is root)
        entry === "",
    );

    const isDir = entry === "" || entry.endsWith("/");

    const entryName = useMemo(() => {
        const segments = getSegments(entry);
        let name = segments.pop();
        if (isDir) name = segments.pop();
        return name;
    }, [isDir, entry]);

    useEffect(() => {
        registerHandler(`explorer-${entry}`, (message) => {
            if (message.entries?.path !== entry) return;
            setEntries(message.entries.list);
        });
    }, [entry, registerHandler]);

    useEffect(() => {
        if (!isConnected || !isDir) return;
        getEntries(entry);
    }, [getEntries, entry, isConnected, isDir]);

    useEffect(() => {
        const segments = getSegments(currentPath);
        let entrySlice = segments.slice(0, depth + 1).join("/");

        if (isDir) {
            entrySlice += "/";
            if (entrySlice === entry) setExpanded(true);
        }

        setIsSelected(currentPath === entry);
    }, [currentPath, depth, entry, isDir]);

    return (
        <div>
            {entryName && (
                <div
                    onClick={() => {
                        setExpanded(true);
                        navigate(entry);
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
                            className="mr-1 flex h-full items-center hover:bg-github-border-default"
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
                entries.map((entry) => (
                    <EntryComponent
                        key={entry}
                        entry={entry}
                        depth={depth + 1}
                        currentPath={currentPath}
                    />
                ))}
        </div>
    );
};
