import { useContext, useRef } from "react";
import { cn, getFileName } from "../../utils.ts";
import { websocketContext } from "../../websocket-context/context.ts";
import { MARKDOWN_ELEMENT_ID } from "../../websocket-context/provider.tsx";
import { Container } from "../container.tsx";
import { CURSOR_LINE_ELEMENT_ID } from "./markdown-it/scroll.ts";

export const Markdown = () => {
    const { currentPath } = useContext(websocketContext);
    const markdownElement = useRef(<div id={MARKDOWN_ELEMENT_ID} className="-mt-9" />);
    const cursorLineElement = useRef(
        <div
            id={CURSOR_LINE_ELEMENT_ID}
            className={cn("absolute pointer-events-none w-full bg-orange-500/20")}
        />,
    );

    const fileName = getFileName(currentPath);

    return (
        <Container>
            <p className="!mb-0 p-4 text-sm font-semibold relative bg-github-canvas-default">
                {fileName}
            </p>
            {markdownElement.current}
            {cursorLineElement.current}
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
