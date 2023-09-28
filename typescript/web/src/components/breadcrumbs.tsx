import { Fragment, useContext } from "react";
import { cn, getSegments } from "../utils.ts";
import { websocketContext } from "../websocket-context/context.ts";

export const BreadCrumbs = () => {
    const { currentPath, navigate } = useContext(websocketContext);
    const segments = getSegments(currentPath);

    function handleClick(idx: number) {
        return () => {
            let path = segments.slice(0, idx).join("/");
            if (path) path += "/";
            navigate(path);
        };
    }

    const repoName = "ROOT";
    const isDir = currentPath?.endsWith("/");
    let segmentsLen = segments.length;
    if (isDir) segmentsLen--;

    return (
        <p className="!mb-0 p-4 font-semibold bg-github-border-muted h-[52px] sticky top-0 z-10 text-[15px] [&>span]:cursor-pointer">
            {[repoName].concat(segments).map((segment, idx) => {
                const isLast = idx === segmentsLen;

                return (
                    <Fragment key={idx}>
                        {idx ? (
                            <span className="mx-1 text-github-fg-subtle font-normal">/</span>
                        ) : null}
                        <span
                            key={idx}
                            className={cn(
                                "hover:underline",
                                isLast ? "pointer-events-none" : "text-github-accent-fg",
                            )}
                            onClick={handleClick(idx)}
                        >
                            {segment}
                        </span>
                    </Fragment>
                );
            })}
        </p>
    );
};
