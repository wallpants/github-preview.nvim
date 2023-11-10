import { useEffect } from "react";
import { type Offsets } from "./scroll.ts";

export const LINE_NUMBERS_ELEMENT_ID = "line-numbers-element-id";

type Props = {
    hash: string | null | undefined;
    offsets: Offsets | null;
    lineNumbersElement: HTMLElement | undefined;
};

export const LineNumbers = ({ hash, offsets, lineNumbersElement }: Props) => {
    useEffect(() => {
        if (!offsets || !lineNumbersElement) return;

        let rangeStart: null | number = null;
        let rangeEnd: null | number = null;

        if (hash) {
            const lineRangeRegexp = /^L(\d+)(?:-L(\d+))?$/;
            const match = lineRangeRegexp.exec(hash);
            if (match) {
                rangeStart = Number(match[1]);
                if (match[2]) rangeEnd = Number(match[2]);
            }
        }

        const html = offsets.reduce((html, offset, index) => {
            const isFirst = index === 0;
            const isLast = index === offsets.length - 1;

            if (isFirst || isLast) return html;

            let style =
                "position: absolute;" +
                `top: ${offset[0]}px;` +
                "transform: translateY(-1px);" +
                "font-size: 13px;" +
                "color: var(--color-fg-subtle);" +
                "width: 45px;" +
                "pointer-events: none;" +
                "text-align: right;";

            if (rangeStart && index >= rangeStart) {
                if (rangeStart === index) {
                    style += "background: var(--color-attention-subtle);";
                }
                if (rangeEnd && index <= rangeEnd) {
                    style += "background: var(--color-attention-subtle);";
                }
            }

            return html + `<span style="${style}">${index}</span>`;
        }, "");

        lineNumbersElement.innerHTML = html;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offsets, lineNumbersElement]);

    return <div id={LINE_NUMBERS_ELEMENT_ID} />;
};
