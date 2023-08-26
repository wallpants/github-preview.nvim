/*
 * https://github.com/iamcco/markdown-preview.nvim/blob/master/app/pages/scroll.js
 */
import { type CursorMove } from "../../../../../types";

function scroll(offsetTop: number) {
    [document.body, document.documentElement].forEach((ele) => {
        ele.scroll({ top: offsetTop, behavior: "smooth" });
    });
}

function getAttrTag(line: number) {
    return `[data-source-line="${line}"]`;
}

function getPreLineOffsetTop(line: number) {
    let currentLine = line - 1;
    let ele: HTMLElement | null = null;
    while (currentLine > 0 && !ele) {
        ele = document.querySelector(getAttrTag(currentLine));
        if (!ele) currentLine -= 1;
    }
    return [currentLine >= 0 ? currentLine : 0, ele ? ele.offsetTop : 0];
}

function getNextLineOffsetTop(line: number, len: number) {
    let currentLine = line + 1;
    let ele: HTMLElement | null = null;
    while (currentLine < len && !ele) {
        ele = document.querySelector(getAttrTag(currentLine));
        if (!ele) currentLine += 1;
    }
    return [
        currentLine < len ? currentLine : len - 1,
        ele ? ele.offsetTop : document.documentElement.scrollHeight,
    ];
}

function topOrBottom(line: number, len: number) {
    if (line === 0) {
        scroll(0);
    } else if (line === len - 1) {
        scroll(document.documentElement.scrollHeight);
    }
}

function relativeScroll(line: number, ratio: number, len: number) {
    let offsetTop = 0;
    const lineEle = document.querySelector(
        `[data-source-line="${line}"]`,
    ) as HTMLElement;
    if (lineEle) {
        offsetTop = lineEle.offsetTop;
    } else {
        const pre = getPreLineOffsetTop(line);
        const next = getNextLineOffsetTop(line, len);
        offsetTop =
            pre[1] +
            ((next[1] - pre[1]) * (line - pre[0])) / (next[0] - pre[0]);
    }
    scroll(offsetTop - document.documentElement.clientHeight * ratio);
}

export const scrollFnMap = {
    relative: function ({
        cursorLine,
        markdownLen,
        winLine,
        winHeight,
    }: CursorMove) {
        const line = cursorLine - 1;
        const ratio = winLine / winHeight;
        if (line === 0 || line === markdownLen - 1) {
            topOrBottom(line, markdownLen);
        } else {
            relativeScroll(line, ratio, markdownLen);
        }
    },
    middle: function ({ cursorLine, markdownLen }: CursorMove) {
        const line = cursorLine - 1;
        if (line === 0 || line === markdownLen - 1) {
            topOrBottom(line, markdownLen);
        } else {
            relativeScroll(line, 0.5, markdownLen);
        }
    },
    top: function ({ cursorLine, winLine, markdownLen }: CursorMove) {
        let line = cursorLine - 1;
        if (line === 0 || line === markdownLen - 1) {
            topOrBottom(line, markdownLen);
        } else {
            line = cursorLine - winLine;
            relativeScroll(line, 0, markdownLen);
        }
    },
};
