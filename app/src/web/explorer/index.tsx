import { useContext, useEffect, useState } from "react";
import { websocketContext } from "../provider/context.ts";
import { cn } from "../utils.ts";
import { EntryComponent } from "./entry.tsx";
import { Footer } from "./footer.tsx";
import { Header } from "./header.tsx";

export const Explorer = () => {
    const { currentPath, isSingleFile } = useContext(websocketContext);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const isDir = Boolean(currentPath?.endsWith("/"));
        if (isDir) setIsExpanded(true);
    }, [currentPath]);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-r-md border border-l-0 border-github-border-default",
                isExpanded ? "w-80" : "w-12",
            )}
        >
            <Header isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            <div className={isExpanded ? "block h-full overflow-auto pb-56 pt-1" : "hidden"}>
                {isSingleFile ? (
                    <div className="!px-3">
                        <h3>Single file mode</h3>
                        <p>Git repository could not be found.</p>
                        <p>File explorer only available when in a repo.</p>
                    </div>
                ) : (
                    <EntryComponent entry="" depth={-1} currentPath={currentPath} />
                )}
            </div>
            <Footer isExpanded={isExpanded} />
        </div>
    );
};
