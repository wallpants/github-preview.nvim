import { Fragment, useContext } from "react";
import { websocketContext } from "../provider/context.ts";
import { cn, getSegments } from "../utils.ts";

export const BreadCrumbs = () => {
    const { isSingleFile, currentPath, repoName, navigate } = useContext(websocketContext);
    const segments = getSegments(currentPath);

    function handleClick(idx: number) {
        return () => {
            let path = segments.slice(0, idx).join("/");
            if (path) path += "/";
            navigate(path);
        };
    }

    const isDir = currentPath?.endsWith("/");
    let segmentsLen = segments.length;
    if (isDir) segmentsLen--;

    return (
        <p className="bg-github-border-muted sticky top-0 z-20 !mb-0 flex h-[40px] min-w-max flex-nowrap overflow-hidden p-2 text-[15px] font-semibold [&>span]:cursor-pointer">
            {[repoName].concat(segments).map((segment, idx) => {
                const isLast = idx === segmentsLen;

                if (isSingleFile && !isLast) return null;

                return (
                    <Fragment key={idx}>
                        {idx ? (
                            <span className="text-github-fg-subtle mx-1 font-normal">/</span>
                        ) : null}
                        <span
                            key={idx}
                            className={cn(
                                "hover:underline",
                                isLast
                                    ? "pointer-events-none font-normal"
                                    : "text-github-accent-fg",
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
