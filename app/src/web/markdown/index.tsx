import { type Mermaid } from "mermaid";
import { Pantsdown } from "pantsdown";
import { useContext, useEffect, useState } from "react";
import { websocketContext } from "../provider/context.ts";
import { cn, getFileExt } from "../utils.ts";
import { BreadCrumbs } from "./breadcrumbs.tsx";
import { CURSOR_LINE_ELEMENT_ID, CursorLine } from "./cursor-line.tsx";
import { LINE_NUMBERS_ELEMENT_ID, LineNumbers } from "./line-numbers.tsx";
import { getScrollOffsets, type Offsets } from "./scroll.ts";

const MARKDOWN_CONTAINER_ID = "markdown-container-id";
const MARKDOWN_ELEMENT_ID = "markdown-element-id";
export const GP_LOCALIMAGE_PREFIX = "/__localimage__/";

const pantsdown = new Pantsdown({
    renderer: {
        relativeImageUrlPrefix: GP_LOCALIMAGE_PREFIX,
        detailsTagDefaultOpen: true,
    },
});

declare const mermaid: Mermaid;

export const Markdown = ({ className }: { className: string }) => {
    const { registerHandler } = useContext(websocketContext);
    const [offsets, setOffsets] = useState<Offsets>([]);
    // const mermaids = useRef<Record<string, string>>({});

    const [markdownElement, setMarkdownElement] = useState<HTMLElement>();
    const [cursorLineElement, setCursorLineElement] = useState<HTMLElement>();
    const [lineNumbersElement, setLineNumbersElement] = useState<HTMLElement>();
    const [markdownContainerElement, setMarkdownContainerElement] = useState<HTMLElement>();

    useEffect(() => {
        setMarkdownElement(document.getElementById(MARKDOWN_ELEMENT_ID)!);
        setCursorLineElement(document.getElementById(CURSOR_LINE_ELEMENT_ID)!);
        setLineNumbersElement(document.getElementById(LINE_NUMBERS_ELEMENT_ID)!);
        setMarkdownContainerElement(document.getElementById(MARKDOWN_CONTAINER_ID)!);
    }, []);

    useEffect(() => {
        if (!markdownElement || !cursorLineElement || !lineNumbersElement) return;
        // const serializer = new XMLSerializer();

        registerHandler("markdown", async (message) => {
            if (message.content) {
                const fileExt = getFileExt(message.currentPath);

                const text = message.content.join("\n");
                const markdown = fileExt === "md" ? text : "```" + fileExt + `\n${text}`;
                markdownElement.innerHTML = pantsdown.parse(markdown);

                // markdownElement.querySelectorAll(".mermaid").forEach((mermaid) => {
                //     const mermaidHash = serializer.serializeToString(mermaid);
                //     if (mermaids.current[mermaidHash]) {
                //         mermaid.outerHTML = mermaids.current[mermaidHash]!;
                //     }
                // });

                await mermaid.run({
                    querySelector: ".mermaid",
                    suppressErrors: true,
                    postRenderCallback(_id) {
                        // console.log("id: ", id);
                    },
                });

                if (fileExt === "md") {
                    markdownElement.style.setProperty("padding", "44px");
                    markdownElement.style.setProperty("max-width", "1012px");
                    cursorLineElement.style.removeProperty("transform");
                    lineNumbersElement.style.setProperty("display", "none");
                } else {
                    // rendering code file
                    markdownElement.style.setProperty("padding", "0 0 0 60px");
                    markdownElement.style.removeProperty("max-width");
                    // move cursorLineElement up so line of code is vertically centered
                    cursorLineElement.style.setProperty("transform", "translateY(-12px)");
                    lineNumbersElement.style.setProperty(
                        "display",
                        message.content.length ? "block" : "none",
                    );

                    // Change code background color to canvas default when displaying only code
                    const codeContainer = markdownElement.getElementsByTagName("pre")[0];
                    if (codeContainer) {
                        codeContainer.style.setProperty("padding", "8px 16px 16px");
                        codeContainer.style.setProperty(
                            "background",
                            "var(--color-canvas-default)",
                        );
                    }
                }
            }
        });
    }, [registerHandler, markdownElement, cursorLineElement, lineNumbersElement]);

    useEffect(() => {
        // recalculate offsets whenever markdownElement's height changes
        if (!markdownElement || !markdownContainerElement) return;

        const observer = new ResizeObserver(() => {
            setOffsets(getScrollOffsets(markdownContainerElement, markdownElement));
        });

        observer.observe(markdownElement);

        return () => {
            observer.disconnect();
        };
    }, [markdownElement, markdownContainerElement]);

    return (
        <div
            className={cn(
                "relative box-border rounded border",
                "border-github-border-default bg-github-canvas-default",
                className,
            )}
            id={MARKDOWN_CONTAINER_ID}
        >
            <BreadCrumbs />
            <CursorLine
                offsets={offsets}
                cursorLineElement={cursorLineElement}
                markdownContainerElement={markdownContainerElement}
            />
            <div id={MARKDOWN_ELEMENT_ID} className="relative mx-auto mb-96" />
            <LineNumbers offsets={offsets} lineNumbersElement={lineNumbersElement} />
        </div>
    );
};
