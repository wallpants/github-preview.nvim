import { useContext, useEffect, useState } from "react";
import { websocketContext } from "../provider/context.ts";
import { scroll, type Offsets } from "./scroll.ts";

export const CURSOR_LINE_ELEMENT_ID = "cursor-line-element-id";

type Props = {
    offsets: Offsets;
    cursorLineElement: HTMLElement | undefined;
    markdownContainerElement: HTMLElement | undefined;
};

export const CursorLine = ({ offsets, cursorLineElement, markdownContainerElement }: Props) => {
    const { registerHandler } = useContext(websocketContext);
    const [cursorLine, setCursorLine] = useState<number | null>(null);
    const [lineColor, setLineColor] = useState<string>();
    const [topOffsetPct, setTopOffsetPct] = useState<number | null>(null);

    useEffect(() => {
        registerHandler("cursor-line", (message) => {
            if (message.cursorLineColor) setLineColor(message.cursorLineColor);
            if (message.cursorLine !== undefined) setCursorLine(message.cursorLine);
            if (message.topOffsetPct !== undefined) setTopOffsetPct(message.topOffsetPct);
        });
    }, [registerHandler]);

    useEffect(() => {
        if (!cursorLineElement || !markdownContainerElement) return;
        scroll(markdownContainerElement, topOffsetPct, offsets, cursorLine, cursorLineElement);
    }, [cursorLine, cursorLineElement, offsets, topOffsetPct, markdownContainerElement]);

    return (
        <div
            id={CURSOR_LINE_ELEMENT_ID}
            className="pointer-events-none absolute h-[36px] w-full"
            style={{ background: lineColor }}
        />
    );
};
