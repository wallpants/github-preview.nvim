import { type PluginInit } from "../../../../../server/src/types";

export const EXPLORER_ELE_ID = "explorer-ele-id";

export function getScrollElements() {
    const elements = document.querySelectorAll("[data-source-line]");
    const offsets: number[] = [];

    let offsetAcc = 0;
    let currLine = 0;

    elements.forEach((element) => {
        const elemStartAttr = element.getAttribute("data-source-line");
        if (!elemStartAttr) return;
        const elemStartLine = Number(elemStartAttr);

        while (currLine !== elemStartLine) {
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

        const averageOffset = Math.floor(scrollHeight / (elemEndLine - elemStartLine));
        while (currLine !== elemEndLine) {
            offsets[currLine++] = offsetAcc;
            offsetAcc += averageOffset;
        }
    });

    return offsets;
}

export const scrollFnMap: Record<
    PluginInit["sync_scroll_type"],
    ({ cursor_line }: { cursor_line: number }, offsets: number[]) => void
> = {
    top: function ({ cursor_line }, offsets) {
        let offset = offsets[cursor_line];
        // eslint-disable-next-line
        while (offset === undefined) {
            offset = offsets[--cursor_line];
        }
        window.scrollTo({ top: offset, behavior: "smooth" });
    },
    middle: function (args) {
        console.log('called scroll["middle"]: ', args);
    },
    bottom: function (args) {
        console.log('called scroll["bottom"]: ', args);
    },
    off: () => null,
};
