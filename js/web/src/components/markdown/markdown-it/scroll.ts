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

    let lastOffset = 0;
    let currLine = 0;

    elements.forEach((element, index) => {
        console.log("-----------------------------------------------");
        console.log("element: ", element);
        const elemStartAttr = element.getAttribute("data-source-line");
        if (!elemStartAttr) return;
        const elemStartLine = Number(elemStartAttr);

        /* sometimes currLine will go past the next element's startLine.
         * this happens when we have something like this:
         *
         * <li data-source-line="14" data-source-line-end="16">
         *      Hello from list item
         *      <ul>
         *          <li data-source-line="15">hello from nested list item</li>
         *      </ul>
         * </li>
         *
         * when processing the outer <li>, currLine will go up to 16,
         * and then when we process the inner <li>, currLine will
         * be greater than currLine */
        while (currLine > elemStartLine) currLine--;

        if (currLine < elemStartLine) {
            const prevElement = elements[index - 1];
            const emptySpace =
                prevElement &&
                Math.max(
                    0,
                    element.offsetTop -
                        (prevElement.offsetTop + prevElement.clientHeight),
                );
            const perLine = emptySpace ? emptySpace / (elemStartLine - currLine) : 0;

            while (currLine < elemStartLine) {
                lastOffset += perLine;
                // console.log("first while");
                // console.log("line: ", currLine);
                // console.log("offsetTop: ", last);
                // console.log("------------------");
                sourceLineOffsets[currLine++] = [lastOffset, element];
            }
        }

        lastOffset = element.offsetTop;

        const elemEndAttr = element.getAttribute("data-source-line-end");
        if (!elemEndAttr) {
            // console.log("no elemEndAttr");
            // console.log("line: ", currLine);
            // console.log("offsetTop: ", last);
            // console.log("------------------");
            sourceLineOffsets[currLine++] = [lastOffset, element];
            return;
        }
        const elemEndLine = Number(elemEndAttr);

        // <code> tags return a scrollHeight of 0
        const scrollHeight =
            element.tagName === "CODE"
                ? element.parentElement?.scrollHeight
                : element.scrollHeight;
        if (scrollHeight === undefined)
            throw Error("scrollHeight could not be determined");

        const averageOffset = Math.floor(scrollHeight / (elemEndLine - elemStartLine));
        while (currLine < elemEndLine) {
            console.log("last while");
            console.log("line: ", currLine);
            console.log("offsetTop: ", lastOffset);
            console.log("------------------");
            sourceLineOffsets[currLine++] = [lastOffset, element];
            lastOffset += averageOffset;
        }
    });

    return {
        markdownTopOffset: document.body.offsetHeight - markdownElement.offsetHeight,
        sourceLineOffsets,
    };
}

export function scroll({ cursor_line }: CursorMove, { sourceLineOffsets }: Offsets) {
    const offset = sourceLineOffsets[cursor_line];
    const element = document.getElementById(SCROLL_INDICATOR);
    if (element) {
        if (!offset) throw Error(`offset for line ${cursor_line} missing`);
        element.style.setProperty("top", `${offset[0]}px`);
    }

    // window.scrollTo({ top: offset[0] + markdownTopOffset, behavior: "smooth" });
}
