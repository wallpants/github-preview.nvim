import { Fragment, useContext } from "react";
import { cn, getBreadCrumbs } from "../utils.ts";
import { websocketContext } from "../websocket-context/context.ts";

export const BreadCrumbs = () => {
    const { currentPath, setCurrentPath } = useContext(websocketContext);
    const breadCrumbs = getBreadCrumbs(currentPath);

    function handleClick(idx?: number) {
        return () => {
            if (typeof idx === "undefined") {
                setCurrentPath("/");
                return;
            }

            // navigate(breadCrumbs.slice(0, idx).join("/") + "/");
        };
    }

    return (
        <p className="!mb-0 p-4 font-semibold bg-github-border-muted h-[52px] sticky top-0 z-10 text-[15px] [&>span]:cursor-pointer">
            <span className="text-github-accent-fg" onClick={handleClick()}>
                ROOT
            </span>
            {breadCrumbs.map((crumb, idx) => {
                const isLast = idx === breadCrumbs.length - 1;

                return (
                    <Fragment key={idx}>
                        <span className="mx-1 text-github-fg-subtle font-normal">/</span>
                        <span
                            key={idx}
                            className={cn(isLast ? "pointer-events-none" : "text-github-accent-fg")}
                            onClick={handleClick(idx + 1)}
                        >
                            {crumb}
                        </span>
                    </Fragment>
                );
            })}
        </p>
    );
};
