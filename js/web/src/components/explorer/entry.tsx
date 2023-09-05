import { cn } from "../../styles";
import { DirIcon } from "./dir-icon";
import { FileIcon } from "./file-icon";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
    dir: <DirIcon className={iconClassName} />,
    file: <FileIcon className={iconClassName} />,
};

type Props = {
    absPath: string;
    isParent?: boolean;
    navigate: (p: string) => void;
};

export const EntryComponent = ({ absPath, isParent, navigate }: Props) => {
    const isDir = absPath.endsWith("/");
    const split = absPath.split("/");
    let name = split.pop();
    if (isDir) name = split.pop();

    function handleClick() {
        navigate(absPath);
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group flex h-[38px] cursor-pointer items-center border-t px-4 first:border-t-0",
                "border-github-border-default hover:bg-github-canvas-subtle",
            )}
        >
            {IconMap[isDir ? "dir" : "file"]}
            <span className="text-sm group-hover:text-github-accent-fg group-hover:underline">
                {isParent ? ".." : name}
            </span>
        </div>
    );
};
