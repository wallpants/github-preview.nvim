import { useEffect } from "react";
import { type RefObject } from "../websocket-provider/context.ts";
import { type Offsets } from "./scroll.ts";

export const LINE_NUMBERS_ELEMENT_ID = "line-numbers-element-id";

type Props = {
    hash: RefObject["hash"];
    offsets: Offsets | null;
    lineNumbersElement: HTMLElement | undefined;
};

export const LineNumbers = ({ hash, offsets, lineNumbersElement }: Props) => {
    useEffect(() => {
        if (!offsets || !lineNumbersElement) return;

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

            if (hash.lineStart && index >= hash.lineStart) {
                if (hash.lineStart === index) {
                    style += "background: var(--color-attention-subtle);";
                }
                if (hash.lineEnd && index <= hash.lineEnd) {
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
