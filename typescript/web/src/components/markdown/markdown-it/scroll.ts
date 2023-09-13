import { MARKDOWN_ELEMENT_ID } from "../../../websocket-context/provider.tsx";

export const SCROLL_INDICATOR = "scroll-indicator-id";

export type Offsets = {
    markdownTopOffset: number;
    sourceLineOffsets: [number, HTMLElement][];
};

type Returns = {
    offsetTop: number;
    scrollHeight: number;
    clientHeight: number;
    elemStartLine: number;
    elemEndLine: number | undefined;
};

// affects line height when calculating offsets in non markdown files
const MAGIC = 12;

function getAttrs(element: HTMLElement): Returns {
    const { tagName, parentElement, offsetTop, scrollHeight, clientHeight } = element;
    const startLineAttr = element.getAttribute("data-source-line");
    const endLineAttr = element.getAttribute("data-source-line-end");

    if (!startLineAttr) throw Error("startLineAttr missing");

    const result: Returns = {
        offsetTop,
        scrollHeight,
        clientHeight,
        elemStartLine: Number(startLineAttr),
        elemEndLine: endLineAttr ? Number(endLineAttr) : undefined,
    };

    if (tagName === "CODE") {
        // we get the data from the <pre> tag surrounding the <code>
        // <code> tags return a scrollHeight of 0 && offsetTop is a bit off
        if (!parentElement) throw Error("<code> element parent not found");
        result.offsetTop = parentElement.offsetTop;
        result.scrollHeight = parentElement.scrollHeight;
        result.clientHeight = parentElement.clientHeight;
    }

    return result;
}

export function getScrollOffsets(): Offsets {
    const markdownElement = document.getElementById(MARKDOWN_ELEMENT_ID);
    if (!markdownElement) throw Error("markdownElement missing");

    const elements: NodeListOf<HTMLElement> = document.querySelectorAll("[data-source-line]");
    const sourceLineOffsets: [number, HTMLElement][] = [];

    let currLine = 0;
    const isCode = elements.length === 1 && elements[0]?.tagName === "CODE";

    elements.forEach((element, index) => {
        const { elemStartLine, elemEndLine, offsetTop, scrollHeight } = getAttrs(element);

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
            let acc = 0;
            let perLine = 0;

            const prevElement = elements[index - 1];
            if (prevElement) {
                const prevAttrs = getAttrs(prevElement);
                const prevEleBottom = prevAttrs.offsetTop + prevAttrs.clientHeight;
                const offsetToInterpolate = offsetTop - prevEleBottom;
                perLine = offsetToInterpolate / (elemStartLine - currLine);
                acc = prevEleBottom;
            }

            while (currLine < elemStartLine) {
                sourceLineOffsets[currLine++] = [acc, element];
                acc += perLine;
            }
        }

        if (!elemEndLine) {
            sourceLineOffsets[currLine++] = [offsetTop, element];
            return;
        }

        let height = scrollHeight;

        if (isCode) {
            // is rendering code only, the margin messes up with
            // the offset calculations
            height -= MAGIC;
        }

        const perLine = height / (elemEndLine - elemStartLine);

        let acc = offsetTop;
        while (currLine <= elemEndLine) {
            sourceLineOffsets[currLine++] = [acc, element];
            acc += perLine;
        }
    });

    if (isCode) {
        //     // remove the fence line
        //     // ```ts    <= we remove that line
        //     endLine--;
        sourceLineOffsets.shift();
    }

    return {
        markdownTopOffset: document.body.offsetHeight - markdownElement.offsetHeight,
        sourceLineOffsets,
    };
}

export function scroll(cursorMoveLine: number, { sourceLineOffsets }: Offsets) {
    const offset = sourceLineOffsets[cursorMoveLine];
    const element = document.getElementById(SCROLL_INDICATOR);
    if (element) {
        if (!offset) throw Error(`offset for line ${cursorMoveLine} missing`);
        element.style.setProperty("top", `${offset[0]}px`);
    }

    // window.scrollTo({ top: offset[0] + markdownTopOffset, behavior: "smooth" });
}
