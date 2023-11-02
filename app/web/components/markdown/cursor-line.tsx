import { useContext, useEffect, useState } from "react";
import { websocketContext } from "../websocket-provider/context.ts";
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
    const [lineColor, setLineColor] = useState<string>("transparent");
    const [topOffsetPct, setTopOffsetPct] = useState<number | null>(null);

    useEffect(() => {
        registerHandler("cursor-line", (message) => {
            if ("config" in message) {
                setLineColor(
                    message.config.overrides.cursor_line.disable
                        ? "transparent"
                        : message.config.overrides.cursor_line.color,
                );

                setTopOffsetPct(
                    message.config.overrides.scroll.disable
                        ? null
                        : message.config.overrides.scroll.top_offset_pct,
                );
            }

            if ("cursorLine" in message) {
                setCursorLine(message.cursorLine);
            }
        });
    }, [registerHandler]);

    useEffect(() => {
        if (!cursorLineElement || !markdownContainerElement) return;
        scroll(markdownContainerElement, topOffsetPct, offsets, cursorLine, cursorLineElement);
    }, [markdownContainerElement, topOffsetPct, offsets, cursorLine, cursorLineElement]);

    return (
        <div
            id={CURSOR_LINE_ELEMENT_ID}
            className="pointer-events-none absolute z-10 h-[36px] w-full"
            style={{ background: lineColor }}
        />
    );
};
