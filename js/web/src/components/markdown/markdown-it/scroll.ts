import { type CursorMove } from "../../../../../server/src/types";
import { MARKDOWN_ELEMENT_ID } from "../../../websocket-context/provider";

export const SCROLL_INDICATOR = "scroll-indicator-id";

export type Offsets = {
    markdownTopOffset: number;
    sourceLineOffsets: number[];
};

export function getScrollOffsets(): Offsets {
    const markdownElement = document.getElementById(MARKDOWN_ELEMENT_ID);
    if (!markdownElement) throw Error("markdownElement missing");

    const elements: NodeListOf<HTMLElement> = document.querySelectorAll("[data-source-line]");
    const sourceLineOffsets: number[] = [];

    let offsetAcc = 0;
    let currLine = 0;

    elements.forEach((element) => {
        const elemStartAttr = element.getAttribute("data-source-line");
        if (!elemStartAttr) return;
        const elemStartLine = Number(elemStartAttr);

        while (currLine < elemStartLine) {
            sourceLineOffsets[currLine++] = offsetAcc;
        }

        // <code> tags return a scrollHeight of 0
        const scrollHeight =
            element.tagName === "CODE" ? element.parentElement?.scrollHeight : element.scrollHeight;
        if (scrollHeight === undefined) return;

        const elemEndAttr = element.getAttribute("data-source-line-end");
        if (!elemEndAttr) {
            // TODO(gualcasas): maybe set offset to element.offsetTop directly
            // if present, and only use the accumulator to calculate offset
            // when rendering code
            sourceLineOffsets[currLine++] = offsetAcc;
            offsetAcc += scrollHeight;
            return;
        }
        const elemEndLine = Number(elemEndAttr);

        const averageOffset = Math.floor(scrollHeight / (elemEndLine - elemStartLine));
        while (currLine < elemEndLine) {
            sourceLineOffsets[currLine++] = offsetAcc;
            offsetAcc += averageOffset;
        }
    });

    return {
        markdownTopOffset: document.body.offsetHeight - markdownElement.offsetHeight,
        sourceLineOffsets,
    };
}

export function scroll(
    { cursor_line }: CursorMove,
    { markdownTopOffset, sourceLineOffsets }: Offsets,
) {
    const offset = sourceLineOffsets[cursor_line];
    // while (offset === undefined) {
    //     offset = sourceLineOffsets[--cursor_line];
    // }
    const element = document.getElementById(SCROLL_INDICATOR);
    if (element) element.style.setProperty("top", `${offset}px`);

    window.scrollTo({ top: offset + markdownTopOffset, behavior: "smooth" });
}
