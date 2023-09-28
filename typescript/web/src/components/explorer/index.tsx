import { useContext } from "react";
import { cn } from "../../utils.ts";
import { websocketContext } from "../../websocket-context/context.ts";
import { Container } from "../container.tsx";
import { ThemePicker } from "../theme-select/index.tsx";
import { EntryComponent } from "./entry.tsx";

export const Explorer = ({ className }: { className: string }) => {
    const { currentPath } = useContext(websocketContext);

    return (
        <Container className={cn("pb-48 border-l-0", className)}>
            <h4 className="!mt-0 px-6">Files</h4>
            <EntryComponent entry="" depth={-1} currentPath={currentPath} />
            <div className="flex items-center justify-center fixed bg-github-canvas-default w-[319px] h-14 bottom-0 border-t border-github-border-default">
                <p className="!mb-0 text-sm text-center mr-4">with ♥️ by wallpants.io</p>
                <ThemePicker />
            </div>
        </Container>
    );
};
