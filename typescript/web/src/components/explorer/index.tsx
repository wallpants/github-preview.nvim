import { useContext } from "react";
import { cn } from "../../utils.ts";
import { websocketContext } from "../../websocket-context/context.ts";
import { Container } from "../container.tsx";
import { ThemePicker } from "../theme-select.tsx";
import { EntryComponent } from "./entry.tsx";

export const Explorer = ({ className }: { className: string }) => {
    const { currentPath } = useContext(websocketContext);

    return (
        <Container className={cn("pb-48", className)}>
            <ThemePicker />
            <h4 className="!my-5 px-6">Files</h4>
            <EntryComponent entry="" depth={-1} currentPath={currentPath} />
        </Container>
    );
};
