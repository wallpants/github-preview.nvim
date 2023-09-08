import { type CursorMove } from "../../../../../server/src/types";
import { MARKDOWN_ELEMENT_ID } from "../../../websocket-context/provider";

export const SCROLL_INDICATOR = "scroll-indicator-id";

export type Offsets = {
    markdownTopOffset: number;
    sourceLineOffsets: [number, HTMLElement][];
};

export function getScrollOffsets(): Offsets {
    const markdownElement = document.getElementById(MARKDOWN_ELEMENT_ID);
    if (!markdownElement) throw Error("markdownElement missing");

    const elements: NodeListOf<HTMLElement> =
        document.querySelectorAll("[data-source-line]");
    const sourceLineOffsets: [number, HTMLElement][] = [];

    let last = 0;
    let currLine = 0;

    elements.forEach((element) => {
        console.log("element: ", element);
        const elemStartAttr = element.getAttribute("data-source-line");
        if (!elemStartAttr) return;
        const elemStartLine = Number(elemStartAttr);

        while (currLine <= elemStartLine) {
            console.log("line: ", currLine);
            console.log("offsetTop: ", last);
            sourceLineOffsets[currLine++] = [last, element];
        }

        const elemEndAttr = element.getAttribute("data-source-line-end");
        if (!elemEndAttr) {
            sourceLineOffsets[currLine++] = [element.offsetTop, element];
            last = element.offsetTop;
            return;
        }
        const elemEndLine = Number(elemEndAttr);

        // TODO(gualcasas) test if this is still true
        // <code> tags return a scrollHeight of 0
        const scrollHeight =
            element.tagName === "CODE"
                ? element.parentElement?.scrollHeight
                : element.scrollHeight;
        if (scrollHeight === undefined) return;

        const averageOffset = Math.floor(scrollHeight / (elemEndLine - elemStartLine));
        while (currLine < elemEndLine) {
            last += averageOffset;
            console.log("line: ", currLine);
            console.log("offsetTop: ", last);
            sourceLineOffsets[currLine++] = [last, element];
        }
    });

    // console.log("offsets: ", sourceLineOffsets);

    return {
        markdownTopOffset: document.body.offsetHeight - markdownElement.offsetHeight,
        sourceLineOffsets,
    };
}

export function scroll(
    { cursor_line }: CursorMove,
    { markdownTopOffset, sourceLineOffsets }: Offsets,
) {
    let offset = sourceLineOffsets[cursor_line];
    // eslint-disable-next-line
    while (offset === undefined) {
        offset = sourceLineOffsets[--cursor_line];
    }
    const element = document.getElementById(SCROLL_INDICATOR);
    if (element) element.style.setProperty("top", `${offset[0]}px`);

    window.scrollTo({ top: offset[0] + markdownTopOffset, behavior: "smooth" });
}
