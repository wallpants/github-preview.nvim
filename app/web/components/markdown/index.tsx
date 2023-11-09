import { Pantsdown } from "pantsdown";
import { useContext, useEffect, useRef, useState } from "react";
import { cn, getFileExt } from "../../utils.ts";
import { websocketContext } from "../websocket-provider/context.ts";
import { BreadCrumbs } from "./breadcrumbs.tsx";
import { CURSOR_LINE_ELEMENT_ID, CursorLine } from "./cursor-line.tsx";
import { Explorer } from "./explorer.tsx";
import { LINE_NUMBERS_ELEMENT_ID, LineNumbers } from "./line-numbers.tsx";
import { mermaidRun } from "./mermaid.ts";
import { evalPantsdownScript, postProcessMarkdown, updateElementsStyles } from "./post-process.ts";
import { getScrollOffsets, type Offsets } from "./scroll.ts";

const MARKDOWN_CONTAINER_ID = "markdown-container-id";
const MARKDOWN_ELEMENT_ID = "markdown-element-id";

const pantsdown = new Pantsdown({
    renderer: {
        relativeImageUrlPrefix: "/__github_preview__/image/",
        detailsTagDefaultOpen: true,
    },
});

export const Markdown = ({ className }: { className: string }) => {
    const { currentPath, config, currentEntries, registerHandler, wsRequest } =
        useContext(websocketContext);

    const skipScroll = useRef(false);
    const single_file = config?.overrides.single_file;
    const details_tags_open = config?.overrides.details_tags_open ?? true;

    const [markdownElement, setMarkdownElement] = useState<HTMLElement>();
    const [cursorLineElement, setCursorLineElement] = useState<HTMLElement>();
    const [lineNumbersElement, setLineNumbersElement] = useState<HTMLElement>();
    const [markdownContainerElement, setMarkdownContainerElement] = useState<HTMLElement>();
    const [offsets, setOffsets] = useState<Offsets>([]);

    useEffect(() => {
        pantsdown.setConfig({ renderer: { detailsTagDefaultOpen: details_tags_open } });
        // re-request content to trigger re-render with new config
        if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [details_tags_open, single_file, wsRequest]);

    useEffect(() => {
        setMarkdownElement(document.getElementById(MARKDOWN_ELEMENT_ID)!);
        setCursorLineElement(document.getElementById(CURSOR_LINE_ELEMENT_ID)!);
        setLineNumbersElement(document.getElementById(LINE_NUMBERS_ELEMENT_ID)!);
        setMarkdownContainerElement(document.getElementById(MARKDOWN_CONTAINER_ID)!);
    }, []);

    useEffect(() => {
        if (
            !markdownContainerElement ||
            !markdownElement ||
            !cursorLineElement ||
            !lineNumbersElement
        )
            return;

        registerHandler("markdown", async (message) => {
            if ("lines" in message) {
                const fileExt = getFileExt(message.currentPath);
                const text = message.lines.join("\n");
                const markdown = fileExt === "md" ? text : "```" + fileExt + `\n${text}`;
                markdownElement.innerHTML = pantsdown.parse(markdown);

                updateElementsStyles({
                    lines: message.lines,
                    fileExt,
                    markdownElement,
                    cursorLineElement,
                    lineNumbersElement,
                });
                evalPantsdownScript(markdownElement);
                postProcessMarkdown({ wsRequest, markdownElement, single_file, skipScroll });
                await mermaidRun();
            }

            if ("linesCountChange" in message && message.linesCountChange) {
                setOffsets(getScrollOffsets(markdownContainerElement, markdownElement));
            }
        });
    }, [
        registerHandler,
        wsRequest,
        single_file,
        markdownElement,
        cursorLineElement,
        lineNumbersElement,
        markdownContainerElement,
    ]);

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
                skipScroll={skipScroll}
                cursorLineElement={cursorLineElement}
                markdownContainerElement={markdownContainerElement}
            />
            <div
                id={MARKDOWN_ELEMENT_ID}
                className={cn("relative mx-auto mb-96", currentEntries ? "invisible" : "visible")}
            />
            <div className="absolute inset-0">
                <Explorer />
            </div>
            <LineNumbers offsets={offsets} lineNumbersElement={lineNumbersElement} />
        </div>
    );
};
