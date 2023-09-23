import { useContext, useRef } from "react";
import { cn, getFileName } from "../../utils.ts";
import { websocketContext } from "../../websocket-context/context.ts";
import { CURSOR_LINE_ELEMENT_ID, MARKDOWN_ELEMENT_ID } from "../../websocket-context/provider.tsx";
import { Container } from "../container.tsx";

export const Markdown = ({ className }: { className: string }) => {
    const { currentPath } = useContext(websocketContext);
    // We use refs, because we don't want these htmlelements ever to rerender
    const markdownElement = useRef(<div id={MARKDOWN_ELEMENT_ID} className="-mt-9" />);
    const cursorLineElement = useRef(
        <div id={CURSOR_LINE_ELEMENT_ID} className="absolute pointer-events-none w-full" />,
    );
    const fileName = getFileName(currentPath);

    return (
        <Container className={cn("mb-[500px]", className)}>
            <p className="!mb-0 p-4 text-sm font-semibold relative bg-github-canvas-default h-[52px]">
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
