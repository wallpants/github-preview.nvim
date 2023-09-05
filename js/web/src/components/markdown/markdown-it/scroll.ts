/*
 * https://github.com/iamcco/markdown-preview.nvim/blob/master/app/pages/scroll.js
 */

import { type PluginInit } from "../../../../../server/src/types";

export const EXPLORER_ELE_ID = "explorer-ele-id";

/** binary search */
export function findClosestLine(arr: number[], target: number): number {
    if (arr.length === 0) {
        throw new Error("Array is empty");
    }

    let left = 0;
    let right = arr.length - 1;
    let closest = arr[0]; // Initialize closest to the first element

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const current = arr[mid];

        if (current === target) {
            return current; // Found an exact match
        }

        if (Math.abs(current - target) < Math.abs(closest - target)) {
            closest = current; // Update closest if the current number is closer
        }

        if (current < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return closest;
}

// Example usage:
// const orderedNumbers = [1, 3, 5, 7, 9, 11, 13];
// const targetNumber = 6;
// const closestNumber = findClosestLine(orderedNumbers, targetNumber);
// console.log(`The closest number to ${targetNumber} is ${closestNumber}`);

// function scroll(offsetTop: number) {
//     const explorerEle = document.getElementById(EXPLORER_ELE_ID);
//     const explorerOffset = explorerEle?.offsetHeight ?? 0;
//     [document.body, document.documentElement].forEach((ele) => {
//         ele.scroll({ top: offsetTop + explorerOffset, behavior: "smooth" });
//     });
// }

// function getAttrTag(line: number) {
//     return `[data-source-line="${line}"]`;
// }

// function getPreLineOffsetTop(line: number) {
//     let currentLine = line - 1;
//     let ele: HTMLElement | null = null;
//     while (currentLine > 0 && !ele) {
//         ele = document.querySelector(getAttrTag(currentLine));
//         if (!ele) currentLine -= 1;
//     }
//     return [currentLine >= 0 ? currentLine : 0, ele ? ele.offsetTop : 0];
// }

// function getNextLineOffsetTop(line: number, len: number) {
//     let currentLine = line + 1;
//     let ele: HTMLElement | null = null;
//     while (currentLine < len && !ele) {
//         ele = document.querySelector(getAttrTag(currentLine));
//         if (!ele) currentLine += 1;
//     }
//     return [
//         currentLine < len ? currentLine : len - 1,
//         ele ? ele.offsetTop : document.documentElement.scrollHeight,
//     ];
// }

// function topOrBottom(line: number, len: number) {
//     if (line === 0) {
//         scroll(0);
//     } else if (line === len - 1) {
//         scroll(document.documentElement.scrollHeight);
//     }
// }

// function relativeScroll(line: number, ratio: number, len: number) {
//     let offsetTop = 0;
//     const lineEle: HTMLElement | null = document.querySelector(`[data-source-line="${line}"]`);
//     if (lineEle) {
//         offsetTop = lineEle.offsetTop;
//     } else {
//         const pre = getPreLineOffsetTop(line);
//         const next = getNextLineOffsetTop(line, len);
//         offsetTop = pre[1] + ((next[1] - pre[1]) * (line - pre[0])) / (next[0] - pre[0]);
//     }
//     scroll(offsetTop - document.documentElement.clientHeight * ratio);
// }

export const scrollFnMap: Record<
    PluginInit["sync_scroll_type"],
    ({ cursor_line }: { cursor_line: number }, fileExt: string | undefined) => void
> = {
    top: function ({ cursor_line }, fileExt) {
        // const elements = document.querySelectorAll("[data-source-line]");
        // const val = elements[0].attributes.getNamedItem("data-source-line")?.value;
        // console.log("elements: ", elements);
        // console.log("typeof first val: ", typeof val);
        // console.log("first val: ", val);
        /* 1. calculate offset above markdown component
         * 2. find cursor_line in html
         * 3. scroll until html element is on top of screen
         */

        // TODO(gualcasas)
        // I don't know if this only applies to nvim.
        // Test this and if it only applies to vim, apply fix in lua.
        // const line = cursor_line - 1;

        console.log("cursor_line: ", cursor_line);
        console.log("fileExt: ", fileExt);
    },
    middle: function (args) {
        console.log('called scroll["middle"]: ', args);
    },
    bottom: function (args) {
        console.log('called scroll["bottom"]: ', args);
    },
    off: () => null,
};
