import { useContext, useEffect, useState } from "react";
import { cn } from "../../utils.ts";
import { runMermaid } from "../markdown/mermaid.ts";
import { websocketContext } from "../websocket-provider/context.ts";
import { EntryComponent } from "./entry.tsx";
import { Footer } from "./footer.tsx";
import { Header } from "./header.tsx";

export const Explorer = () => {
    const { currentPath, config } = useContext(websocketContext);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const isDir = Boolean(currentPath?.endsWith("/"));
        if (isDir) setIsExpanded(true);
    }, [currentPath]);

    useEffect(() => {
        void runMermaid();
    }, [isExpanded]);

    return (
        <div
            className={cn(
                "relative rounded-r-md border border-l-0 border-github-border-default",
                isExpanded ? "w-80" : "w-12",
            )}
        >
            <div
                className={
                    isExpanded ? "absolute inset-0 block overflow-y-auto pb-56 pt-16" : "hidden"
                }
            >
                {config?.overrides.single_file ? (
                    <div className="!px-3">
                        <h3>Single-file mode</h3>
                        <p>Git repository could not be found.</p>
                        <p>File explorer only available when in a repo.</p>
                    </div>
                ) : (
                    <EntryComponent path="" depth={-1} currentPath={currentPath} />
                )}
            </div>
            <Header
                className="absolute inset-x-0 top-0 rounded-tr-md"
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
            />
            <Footer isExpanded={isExpanded} />
        </div>
    );
};
