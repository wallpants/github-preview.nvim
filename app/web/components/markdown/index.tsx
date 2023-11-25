import { Pantsdown } from "pantsdown";
import { useContext, useEffect, useState } from "react";
import { cn, getFileExt, isEqual } from "../../utils.ts";
import { websocketContext } from "../websocket-provider/context.ts";
import { BreadCrumbs } from "./breadcrumbs.tsx";
import { CURSOR_LINE_ELEMENT_ID, CursorLine } from "./cursor-line.tsx";
import { Explorer } from "./explorer.tsx";
import { LINE_NUMBERS_ELEMENT_ID, LineNumbers } from "./line-numbers.tsx";
import { myMermaid } from "./mermaid.ts";
import { postProcessHrefs, updateElementsStyles } from "./post-process.ts";
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
    const { currentPath, config, refObject, registerHandler, wsRequest } =
        useContext(websocketContext);

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
        const hasOverrides = !isEqual(config?.dotfiles, config?.overrides);
        if (currentPath && hasOverrides) {
            refObject.current.skipScroll = true;
            wsRequest({ type: "get_entry", path: currentPath });
        }
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

        registerHandler("markdown", (message) => {
            if ("lines" in message) {
                const fileExt = getFileExt(message.currentPath);
                const text = message.lines.join("\n");
                const markdown = fileExt === "md" ? text : "```" + fileExt + `\n${text}`;

                const { html, javascript } = pantsdown.parse(markdown);

                // We create a tempElement so we can post-process html before actually
                // adding it to the DOM. This way we can avoid screen jumps caused
                // by html replacements that happen during post-process.
                const tempElement = document.createElement("div");
                tempElement.innerHTML = html;

                postProcessHrefs({
                    wsRequest,
                    tempElement,
                    refObject,
                    single_file,
                });

                myMermaid.renderMemoized(tempElement);

                markdownElement.replaceChildren(...tempElement.children);

                updateElementsStyles({
                    lines: message.lines,
                    fileExt,
                    markdownElement,
                    cursorLineElement,
                    lineNumbersElement,
                });

                const newScript = document.createElement("script");
                newScript.text = javascript;
                markdownElement.appendChild(newScript);

                void myMermaid.renderAsync();
            }

            if ("linesCountChange" in message && message.linesCountChange) {
                setOffsets(getScrollOffsets(markdownContainerElement, markdownElement));
            }
        });
    }, [
        registerHandler,
        wsRequest,
        refObject,
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

    const isDir = currentPath?.endsWith("/");

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
            <div
                id={MARKDOWN_ELEMENT_ID}
                className={cn("relative mx-auto mb-96", isDir ? "invisible" : "visible")}
            />
            {isDir ? (
                <div className="absolute inset-x-0 top-0">
                    <Explorer />
                </div>
            ) : null}
            <LineNumbers
                hash={refObject.current.hash}
                offsets={offsets}
                lineNumbersElement={lineNumbersElement}
            />
        </div>
    );
};
