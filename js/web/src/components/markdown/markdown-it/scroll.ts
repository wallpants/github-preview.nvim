/*
 * https://github.com/iamcco/markdown-preview.nvim/blob/master/app/pages/scroll.js
 */

import { type CursorMove } from "../../../types";

export const EXPLORER_ELE_ID = "explorer-ele-id";

function scroll(offsetTop: number) {
    const explorerEle = document.getElementById(EXPLORER_ELE_ID);
    const explorerOffset = explorerEle?.offsetHeight ?? 0;
    [document.body, document.documentElement].forEach((ele) => {
        ele.scroll({ top: offsetTop + explorerOffset, behavior: "smooth" });
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
    const lineEle: HTMLElement | null = document.querySelector(`[data-source-line="${line}"]`);
    if (lineEle) {
        offsetTop = lineEle.offsetTop;
    } else {
        const pre = getPreLineOffsetTop(line);
        const next = getNextLineOffsetTop(line, len);
        offsetTop = pre[1] + ((next[1] - pre[1]) * (line - pre[0])) / (next[0] - pre[0]);
    }
    scroll(offsetTop - document.documentElement.clientHeight * ratio);
}

export const scrollFnMap = {
    relative: function ({ cursor_line, content_len, win_line, win_height }: CursorMove) {
        const line = cursor_line - 1;
        const ratio = win_line / win_height;
        if (line === 0 || line === content_len - 1) {
            topOrBottom(line, content_len);
        } else {
            relativeScroll(line, ratio, content_len);
        }
    },
    middle: function ({ cursor_line, content_len }: CursorMove) {
        const line = cursor_line - 1;
        if (line === 0 || line === content_len - 1) {
            topOrBottom(line, content_len);
        } else {
            relativeScroll(line, 0.5, content_len);
        }
    },
    top: function ({ cursor_line, win_line, content_len }: CursorMove) {
        let line = cursor_line - 1;
        if (line === 0 || line === content_len - 1) {
            topOrBottom(line, content_len);
        } else {
            line = cursor_line - win_line;
            relativeScroll(line, 0, content_len);
        }
    },
};
