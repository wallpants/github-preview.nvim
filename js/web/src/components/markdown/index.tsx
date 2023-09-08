import { useContext } from "react";
import { cn, getFileName } from "../../utils";
import { websocketContext } from "../../websocket-context/context";
import { MARKDOWN_ELEMENT_ID } from "../../websocket-context/provider";
import { Container } from "../container";
import { SCROLL_INDICATOR } from "./markdown-it/scroll";

const FILENAME_HEIGHT = 52;

export const Markdown = ({ className }: { className?: string }) => {
    const { state } = useContext(websocketContext);

    const fileName = getFileName(state.current?.currentPath);

    return (
        <Container className={cn(className, "!p-0")}>
            <p
                className="!mb-0 p-4 text-sm font-semibold z-20 relative bg-github-canvas-default"
                style={{ height: FILENAME_HEIGHT }}
            >
                {fileName}
            </p>
            <div id={MARKDOWN_ELEMENT_ID} className="relative" />
            <div
                id={SCROLL_INDICATOR}
                style={{ marginTop: FILENAME_HEIGHT }}
                className="absolute pointer-events-none z-0 w-full h-10 bg-orange-500/20"
            />
        </Container>
    );
};
