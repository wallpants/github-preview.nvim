import { useRef } from "react";
import {
    CURSOR_LINE_ELEMENT_ID,
    LINE_NUMBERS_ELEMENT_ID,
    MARKDOWN_CONTAINER_ID,
    MARKDOWN_ELEMENT_ID,
} from "../../websocket-context/provider.tsx";
import { BreadCrumbs } from "../breadcrumbs.tsx";
import { Container } from "../container.tsx";

export const Markdown = ({ className }: { className: string }) => {
    // We use refs, because we don't want these htmlelements ever to rerender
    const markdownElement = useRef(<div id={MARKDOWN_ELEMENT_ID} className="mx-auto mb-96" />);
    const cursorLineElement = useRef(
        <div
            id={CURSOR_LINE_ELEMENT_ID}
            className="absolute pointer-events-none w-full h-[36px]"
        />,
    );
    const lineNumbers = useRef(<div id={LINE_NUMBERS_ELEMENT_ID} />);

    return (
        <Container className={className} id={MARKDOWN_CONTAINER_ID}>
            <BreadCrumbs />
            {markdownElement.current}
            {lineNumbers.current}
            {cursorLineElement.current}
        </Container>
    );
};
