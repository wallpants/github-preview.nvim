import { type HTMLAttributes } from "react";
import { type RefObject } from "../websocket-provider/context.ts";
import { type Offsets } from "./scroll.ts";

export const LINE_NUMBERS_ELEMENT_ID = "line-numbers-element-id";

type Props = {
    hash: RefObject["hash"];
    offsets: Offsets | null;
    currentPath: string | null;
};

export const LineNumbers = ({ hash, offsets, currentPath }: Props) => (
    <div id={LINE_NUMBERS_ELEMENT_ID}>
        {currentPath &&
            offsets?.map(([offset], index) => {
                const isFirst = index === 0;
                const isLast = index === offsets.length - 1;
                if (isFirst || isLast) return null;

                const style: HTMLAttributes<HTMLSpanElement>["style"] = { top: offset };

                if (hash.lineStart && index >= hash.lineStart) {
                    if (hash.lineStart === index) {
                        style.background = "background: var(--color-attention-subtle);";
                    }
                    if (hash.lineEnd && index <= hash.lineEnd) {
                        style.background = "background: var(--color-attention-subtle);";
                    }
                }

                return (
                    <span
                        key={currentPath + String(index)}
                        style={style}
                        className="text-github-fg-subtle pointer-events-none absolute w-[45px] -translate-y-px text-right text-[13px]"
                    >
                        {index}
                    </span>
                );
            })}
    </div>
);
