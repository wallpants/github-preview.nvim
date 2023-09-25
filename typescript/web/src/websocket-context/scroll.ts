// affects line height when calculating offsets in non markdown files
const MAGIC = 12;

type Attrs = {
    offsetTop: number;
    scrollHeight: number;
    clientHeight: number;
    elemStartLine: number;
    elemEndLine: number | undefined;
};

function getAttrs(element: HTMLElement): Attrs {
    const { tagName, parentElement, offsetTop, scrollHeight, clientHeight } = element;
    const startLineAttr = element.getAttribute("data-source-line");
    const endLineAttr = element.getAttribute("data-source-line-end");

    if (!startLineAttr) throw Error("startLineAttr missing");

    const attrs: Attrs = {
        offsetTop,
        scrollHeight,
        clientHeight,
        elemStartLine: Number(startLineAttr),
        elemEndLine: endLineAttr ? Number(endLineAttr) : undefined,
    };

    if (tagName === "CODE") {
        // we get the data from the <pre> tag surrounding the <code>
        // <code> tags return a scrollHeight of 0 & offsetTop is a bit off
        if (!parentElement) throw Error("<code> element parent not found");
        attrs.offsetTop = parentElement.offsetTop;
        attrs.scrollHeight = parentElement.scrollHeight;
        attrs.clientHeight = parentElement.clientHeight;
    }

    return attrs;
}

export type Offsets = [number, HTMLElement][];

export function getScrollOffsets(): Offsets {
    const elements: NodeListOf<HTMLElement> = document.querySelectorAll("[data-source-line]");
    // HTMLElement kept arround for debugging purposes
    const sourceLineOffsets: [number, HTMLElement][] = [];

    let currLine = 0;
    const isCode = elements.length === 1 && elements[0]?.tagName === "CODE";

    elements.forEach((element, index) => {
        const { elemStartLine, elemEndLine, offsetTop, scrollHeight } = getAttrs(element);

        while (currLine > elemStartLine) {
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
             * be greater than elemStartLine */
            currLine--;
        }

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
        // remove the fence line
        // ```ts    <= we remove that line
        sourceLineOffsets.shift();
    }

    return sourceLineOffsets;
}

export function scroll(
    topOffsetPct: number | null | undefined,
    offsets: Offsets,
    cursorLine: number,
    markdownContainer: HTMLElement,
    cursorLineElement: HTMLElement,
) {
    let cursorLineOffset = offsets[cursorLine];

    while (!cursorLineOffset) {
        // When adding new lines at the end of the buffer, the offset for the
        // new lines is not available until cursorHold
        cursorLineOffset = offsets[--cursorLine];
    }

    cursorLineElement.style.setProperty("top", `${cursorLineOffset[0]}px`);
    cursorLineElement.style.setProperty("visibility", "visible");

    if (typeof topOffsetPct === "number") {
        const percent = topOffsetPct / 100;
        markdownContainer.scrollTo({
            top: cursorLineOffset[0] + markdownContainer.offsetTop - window.screen.height * percent,
            behavior: "smooth",
        });
    }
}
