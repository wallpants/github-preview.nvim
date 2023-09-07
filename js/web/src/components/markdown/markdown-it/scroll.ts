import { type CursorMove } from "../../../../../server/src/types";

export const EXPLORER_ELE_ID = "explorer-ele-id";
export const SCROLL_INDICATOR = "scroll-indicator-id";

export function getScrollOffsets() {
    const elements: NodeListOf<HTMLElement> = document.querySelectorAll("[data-source-line]");
    const offsets: number[] = [];

    // let offsetTop = 0;
    let offsetAcc = 0;
    let currLine = 0;

    elements.forEach((element) => {
        // if (!offsetTop) {
        //     offsetTop = element.offsetTop;
        //     console.log("offsetTop: ", offsetTop);
        //     offsetAcc += offsetTop;
        // }

        const elemStartAttr = element.getAttribute("data-source-line");
        if (!elemStartAttr) return;
        const elemStartLine = Number(elemStartAttr);

        while (currLine < elemStartLine) {
            console.log("currLine: ", currLine);
            console.log("elemStartLine: ", elemStartLine);
            console.log("offsets: ", offsets);
            offsets[currLine++] = offsetAcc;
        }

        // <code> tags return a scrollHeight of 0
        const scrollHeight =
            element.tagName === "CODE" ? element.parentElement?.scrollHeight : element.scrollHeight;
        if (scrollHeight === undefined) return;

        const elemEndAttr = element.getAttribute("data-source-line-end");
        if (!elemEndAttr) {
            offsetAcc += scrollHeight;
            offsets[currLine++] = offsetAcc;
            return;
        }
        const elemEndLine = Number(elemEndAttr);

        console.log("scrollHeight: ", scrollHeight);
        const averageOffset = Math.floor(scrollHeight / (elemEndLine - elemStartLine));
        while (currLine < elemEndLine) {
            offsetAcc += averageOffset;
            offsets[currLine++] = offsetAcc;
        }
    });

    console.log("offsets: ", offsets);
    return offsets;
}

export function scroll({ cursor_line }: CursorMove, offsets: number[]) {
    let offset = offsets[cursor_line];
    // eslint-disable-next-line
    while (offset === undefined) {
        offset = offsets[--cursor_line];
    }
    const element = document.getElementById(SCROLL_INDICATOR);
    if (element) element.style.setProperty("top", `${offset}px`);
    window.scrollTo({ top: offset, behavior: "smooth" });
}
