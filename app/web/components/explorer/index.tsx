import { useContext, useEffect, useState } from "react";
import { type Config } from "../../../types.ts";
import { useOnDocumentClick } from "../../use-on-document-click.ts";
import { cn, isEqual } from "../../utils.ts";
import { mermaidRun } from "../markdown/mermaid.ts";
import { websocketContext } from "../websocket-provider/context.ts";
import { EntryComponent } from "./entry.tsx";
import { Footer } from "./footer.tsx";
import { Header } from "./header.tsx";
import { CollapsedOption } from "./settings/collapsed-option.tsx";
import { Settings } from "./settings/index.tsx";

export const Explorer = () => {
    const { currentPath, config } = useContext(websocketContext);
    const [configOpen, setConfigOpen] = useState<null | keyof Config | "no-key">(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [settingsOffset, setSettingsOffset] = useState(0);
    const isOverriden = !isEqual(config?.dotfiles, config?.overrides);

    useOnDocumentClick({
        disabled: !configOpen,
        callback: () => {
            setConfigOpen(null);
        },
    });

    useEffect(() => {
        const isDir = Boolean(currentPath?.endsWith("/"));
        if (isDir) setIsExpanded(true);
    }, [currentPath]);

    useEffect(() => {
        void mermaidRun();
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
                className="absolute inset-x-0 top-0 z-10 rounded-tr-md"
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                setSettingsOffset={setSettingsOffset}
                setConfigOpen={setConfigOpen}
                isOverriden={isOverriden}
            />
            {!isExpanded && (
                <div className="absolute inset-0 overflow-y-hidden">
                    <div className="absolute inset-0 flex flex-col justify-center gap-y-3">
                        <CollapsedOption
                            className="mb-20"
                            setSettingsOffset={setSettingsOffset}
                            setConfigOpen={setConfigOpen}
                            active={"single_file" === configOpen}
                            cKey="single_file"
                        />
                        <CollapsedOption
                            setSettingsOffset={setSettingsOffset}
                            setConfigOpen={setConfigOpen}
                            active={"scroll" === configOpen}
                            cKey="scroll"
                        />
                        <CollapsedOption
                            setSettingsOffset={setSettingsOffset}
                            setConfigOpen={setConfigOpen}
                            active={"cursor_line" === configOpen}
                            cKey="cursor_line"
                        />
                        <CollapsedOption
                            setSettingsOffset={setSettingsOffset}
                            setConfigOpen={setConfigOpen}
                            active={"details_tags_open" === configOpen}
                            cKey="details_tags_open"
                        />
                        <CollapsedOption
                            setSettingsOffset={setSettingsOffset}
                            setConfigOpen={setConfigOpen}
                            active={"theme" === configOpen}
                            cKey="theme"
                        />
                    </div>
                </div>
            )}
            {configOpen ? (
                <Settings
                    cKey={configOpen}
                    isOverriden={isOverriden}
                    settingsOffset={settingsOffset}
                />
            ) : null}
            <Footer isExpanded={isExpanded} />
        </div>
    );
};
