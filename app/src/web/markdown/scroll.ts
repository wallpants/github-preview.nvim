// affects line height when calculating offsets in non markdown files
const MAGIC = 4;

type Attrs = {
    offsetTop: number;
    scrollHeight: number;
    clientHeight: number;
    elemStartLine: number;
    elemEndLine: number;
};

function getAttrs(element: HTMLElement): Attrs {
    const { tagName, parentElement, offsetTop, scrollHeight, clientHeight } = element;
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

    if (tagName === "TR") {
        /* <tr>'s offsetTop is relative to the table component.
         * <tr> are nested in a <thead> or <tbody> within a <table>
         *
         * <table>
         *     <thead>
         *         <tr line-start="10" line-end="10"></tr>
         *     </thead>
         *     <tbody>
         *         <tr line-start="12" line-end="12"></tr>
         *     </tbody>
         * </table>
         */
        attrs.offsetTop += parentElement!.parentElement!.offsetTop;
    }

    return attrs;
}

export type Offsets = [number, HTMLElement][];

export function getScrollOffsets(
    markdownContainerElement: HTMLElement,
    markdownElement: HTMLElement,
): Offsets {
    const elements: NodeListOf<HTMLElement> = document.querySelectorAll("[line-start]");
    // HTMLElement kept arround for debugging purposes
    const sourceLineOffsets: Offsets = [];

    let currLine = 0;
    const isCode =
        elements.length === 1 &&
        elements[0]?.tagName === "PRE" &&
        elements[0].children.length === 1 &&
        elements[0].firstElementChild?.tagName === "CODE";

    for (let index = 0, len = elements.length; index < len; index++) {
        const element = elements[index]!;
        const { elemStartLine, elemEndLine, offsetTop, scrollHeight } = getAttrs(element);

        if (currLine < elemStartLine) {
            let acc = markdownElement.offsetTop + markdownElement.getBoundingClientRect().top;
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
