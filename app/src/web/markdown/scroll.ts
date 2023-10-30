// affects line height when calculating offsets in non markdown files
const MAGIC = 4;

type Attrs = {
    offsetTop: number;
    scrollHeight: number;
    clientHeight: number;
    elemStartLine: number;
    elemEndLine: number;
};

function getAttrs(markdownContainerElement: HTMLElement, element: HTMLElement): Attrs {
    const { offsetTop, scrollHeight, clientHeight } = element;
    const startLineAttr = element.getAttribute("line-start");
    const endLineAttr = element.getAttribute("line-end");

    if (!startLineAttr || !endLineAttr) throw Error("sourceMap info missing");

    const attrs: Attrs = {
        offsetTop,
        scrollHeight,
        clientHeight,
        elemStartLine: Number(startLineAttr),
        elemEndLine: Number(endLineAttr),
    };

    let offsetParent = element.offsetParent as HTMLElement | null;

    while (offsetParent !== null && offsetParent.id !== markdownContainerElement.id) {
        attrs.offsetTop += offsetParent.offsetTop;
        offsetParent = offsetParent.offsetParent as HTMLElement | null;
    }

    return attrs;
}

export type Offsets = [number, HTMLElement][];

export function getScrollOffsets(
    markdownContainerElement: HTMLElement,
    markdownElement: HTMLElement,
): Offsets {
    // Elements must be sorted or footnote sourcemaps mess up with offsets.
    // TODO: We could also think of a way to handle elements not being ordered
    const sortedElements = Array.from(document.querySelectorAll("[line-start]")).sort(
        (a, b) => Number(a.getAttribute("line-start")) - Number(b.getAttribute("line-start")),
    ) as HTMLElement[];

    console.log("sortedElements: ", sortedElements);

    // HTMLElement kept arround for debugging purposes
    const sourceLineOffsets: Offsets = [];

    let currLine = 0;
    const isCode =
        sortedElements.length === 1 &&
        sortedElements[0]?.tagName === "PRE" &&
        sortedElements[0].children.length === 1 &&
        sortedElements[0].firstElementChild?.tagName === "CODE";

    for (let index = 0, len = sortedElements.length; index < len; index++) {
        const element = sortedElements[index]!;

        if (!element.checkVisibility()) {
            continue;
        }

        const { elemStartLine, elemEndLine, offsetTop, scrollHeight } = getAttrs(
            markdownContainerElement,
            element,
        );

        if (currLine >= elemStartLine) {
            currLine = elemStartLine;
        } else {
            let acc = markdownElement.offsetTop + markdownElement.getBoundingClientRect().top;
            let perLine = 0;

            const prevElement = sortedElements[index - 1];
            if (prevElement) {
                const prevAttrs = getAttrs(markdownContainerElement, prevElement);
                const prevEleBottom = prevAttrs.offsetTop + prevAttrs.clientHeight;
                const offsetToInterpolate = offsetTop - prevEleBottom;
                perLine = offsetToInterpolate / (elemStartLine - currLine);
                acc = prevEleBottom;
            }

            while (currLine < elemStartLine) {
                sourceLineOffsets[currLine] = [acc, element];

                if (!acc && sourceLineOffsets[currLine - 1]?.[0]) {
                    // In some cases acc is 0 here
                    // it happens inside of <details>, maybe there are other cases.
                    // If there's a prev offset already, we copy the value over
                    sourceLineOffsets[currLine]![0] = sourceLineOffsets[currLine - 1]![0];
                }

                currLine++;
                acc += perLine;
            }
        }

        let height = scrollHeight;
        let acc = offsetTop;

        if (isCode) {
            height -= MAGIC;
            acc += markdownContainerElement.offsetTop;
        }

        const perLine = height / (elemEndLine + 1 - elemStartLine);

        while (currLine <= elemEndLine) {
            sourceLineOffsets[currLine++] = [acc, element];
            acc += perLine;
        }
    }

    return sourceLineOffsets;
}

export function scroll(
    markdownContainerElement: HTMLElement,
    topOffsetPct: number | null,
    offsets: Offsets,
    cursorLine: number | null,
    cursorLineElement: HTMLElement,
) {
    if (cursorLine === null) {
        cursorLineElement.style.setProperty("visibility", "hidden");
        markdownContainerElement.scrollTo({ top: 0, behavior: "instant" });
        return;
    }

    if (!offsets.length) return;

    let cursorLineOffset = offsets[cursorLine];

    while (!cursorLineOffset) {
        // When adding new lines at the end of the buffer, the offset for the
        // new lines is not available until cursorHold
        cursorLineOffset = offsets[--cursorLine];
    }

    cursorLineElement.style.setProperty("top", `${cursorLineOffset[0]}px`);
    cursorLineElement.style.setProperty("visibility", "visible");

    if (typeof topOffsetPct !== "number") return;

    const percent = topOffsetPct / 100;
    markdownContainerElement.scrollTo({
        top:
            cursorLineOffset[0] +
            markdownContainerElement.offsetTop -
            window.screen.height * percent,
        behavior: "smooth",
    });
}
