// import { useContext } from "react";
// import { websocketContext } from "../../websocket-context/context";
import { cn } from "../../utils";
import { MARKDOWN_ELEMENT_ID } from "../../websocket-context/provider";
import { Container } from "../container";
import { SCROLL_INDICATOR } from "./markdown-it/scroll";

export const Markdown = ({ className }: { className?: string }) => {
    // const { currentPath } = useContext(websocketContext);

    // const fileName = getFileName(currentPath);

    return (
        <Container className={cn(className, "!p-0")}>
            {/* <p className="!mb-0 p-4 text-sm font-semibold">{fileName}</p> */}
            <div id={MARKDOWN_ELEMENT_ID} />
            <div id={SCROLL_INDICATOR} className="absolute w-full h-10 bg-orange-500/25" />
        </Container>
    );
};
