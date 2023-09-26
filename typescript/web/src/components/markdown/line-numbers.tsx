import { useEffect } from "react";
import { type Offsets } from "../../websocket-context/scroll.ts";

export const LINE_NUMBERS_ELEMENT_ID = "line-numbers-element-id";

type Props = {
    offsets: Offsets | null;
    lineNumbersElement: HTMLElement | undefined;
};

export const LineNumbers = ({ offsets, lineNumbersElement }: Props) => {
    useEffect(() => {
        if (!offsets || !lineNumbersElement) return;

        const html = offsets.reduce((html, offset, index) => {
            if (index === offsets.length - 1) return html;
            const style = `position: absolute; top: ${offset[0]}px; transform: translateY(-4px); font-size: 13px; width: 45px; text-align: right; color: var(--color-fg-subtle); pointer-events: none;`;
            return html + `<span style="${style}">${index + 1}</span>`;
        }, "");

        lineNumbersElement.innerHTML = html;
    }, [offsets, lineNumbersElement]);

    return <div id={LINE_NUMBERS_ELEMENT_ID} />;
};
