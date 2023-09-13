import { useContext } from "react";
import { cn, getFileExt, getFileName } from "../../utils.ts";
import { websocketContext } from "../../websocket-context/context.ts";
import { MARKDOWN_ELEMENT_ID } from "../../websocket-context/provider.tsx";
import { Container } from "../container.tsx";
import { SCROLL_INDICATOR } from "./markdown-it/scroll.ts";

export const Markdown = () => {
    const { state } = useContext(websocketContext);

    const fileName = getFileName(state.current?.currentPath);
    const fileExt = getFileExt(fileName);

    return (
        <Container>
            <p className="!mb-0 p-4 text-sm font-semibold relative bg-github-canvas-default">
                {fileName}
            </p>
            <div id={MARKDOWN_ELEMENT_ID} className="-mt-9" />
            <div
                id={SCROLL_INDICATOR}
                className={cn(
                    "absolute pointer-events-none w-full bg-orange-500/20",
                    fileExt !== "md" ? "-translate-y-3 h-9" : "h-11",
                )}
            />
            {/*offsets.current?.sourceLineOffsets.map(([offset], index) => (
                <div
                    key={index}
                    style={{ top: offset }}
                    className="absolute left-0 h-10 text-xs -translate-y-0.5"
                >
                    {index + 1}
                </div>
            ))*/}
        </Container>
    );
};
