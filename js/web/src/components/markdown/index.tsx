import { useContext } from "react";
import { getFileName } from "../../utils";
import { websocketContext } from "../../websocket-context/context";
import { MARKDOWN_ELEMENT_ID } from "../../websocket-context/provider";
import { Container } from "../container";
import { SCROLL_INDICATOR } from "./markdown-it/scroll";

export const Markdown = ({ className }: { className?: string }) => {
    const { currentPath } = useContext(websocketContext);

    const fileName = getFileName(currentPath);

    return (
        <Container className={className}>
            <p className="!mb-0 p-4 text-sm font-semibold">{fileName}</p>
            <div id={MARKDOWN_ELEMENT_ID} />
            <div id={SCROLL_INDICATOR} className="absolute w-full h-20 bg-orange-500/25" />
        </Container>
    );
};
