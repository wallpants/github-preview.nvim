import { Fragment, useContext, useState } from "react";
import { cn, getSegments } from "../../utils.ts";
import { IconButton } from "../icon-button.tsx";
import { CheckIcon } from "../icons/check.tsx";
import { CopyIcon } from "../icons/copy.tsx";
import { websocketContext } from "../websocket-provider/context.ts";

export const BreadCrumbs = () => {
    const { config, currentPath, repoName, wsRequest } = useContext(websocketContext);
    const [copySuccess, setCopySuccess] = useState(false);
    const segments = getSegments(currentPath);

    function handleClick(idx: number) {
        return () => {
            let path = segments.slice(0, idx).join("/");
            if (path) path += "/";
            wsRequest({ type: "get_entry", path });
        };
    }

    const isDir = currentPath?.endsWith("/");
    let segmentsLen = segments.length;
    if (isDir) segmentsLen--;

    return (
        <p className="border-b-github-border-default bg-github-canvas-subtle sticky top-0 z-20 !mb-0 flex h-[40px] min-w-max flex-nowrap overflow-hidden border-b p-2 text-[15px] font-semibold [&>span]:cursor-pointer">
            {[repoName].concat(segments).map((segment, idx) => {
                const isLast = idx === segmentsLen;

                if (config?.overrides.single_file && !isLast) return null;

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
            <IconButton
                Icon={copySuccess ? CheckIcon : CopyIcon}
                className="hover:bg-github-canvas-default -mt-1 ml-2 size-8 items-center justify-center p-0"
                iconClassName={cn("h-4 w-4", copySuccess && "stroke-github-success-fg")}
                noBorder
                onClick={() => {
                    currentPath &&
                        navigator.clipboard
                            .writeText("/" + currentPath)
                            .then(() => {
                                setCopySuccess(true);
                                setTimeout(() => {
                                    setCopySuccess(false);
                                }, 1000);
                            })
                            .catch(() => {
                                //
                            });
                }}
            />
        </p>
    );
};
