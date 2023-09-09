import { useContext } from "react";
import { getFileName } from "../../utils";
import { websocketContext } from "../../websocket-context/context";
import { MARKDOWN_ELEMENT_ID } from "../../websocket-context/provider";
import { Container } from "../container";
import { SCROLL_INDICATOR } from "./markdown-it/scroll";

export const Markdown = () => {
    const { state } = useContext(websocketContext);

    const fileName = getFileName(state.current?.currentPath);

    return (
        <Container>
            <p className="!mb-0 p-4 text-sm font-semibold z-20 relative bg-github-canvas-default">
                {fileName}
            </p>
            <div id={MARKDOWN_ELEMENT_ID} className="-mt-9" />
            <div
                id={SCROLL_INDICATOR}
                className="absolute pointer-events-none z-0 w-full h-10 bg-orange-500/20"
            />
        </Container>
    );
};
