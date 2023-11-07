import { Pantsdown } from "pantsdown";
import { useContext, useEffect, useState } from "react";
import { cn, getFileExt } from "../../utils.ts";
import { websocketContext } from "../websocket-provider/context.ts";
import { BreadCrumbs } from "./breadcrumbs.tsx";
import { CURSOR_LINE_ELEMENT_ID, CursorLine } from "./cursor-line.tsx";
import { LINE_NUMBERS_ELEMENT_ID, LineNumbers } from "./line-numbers.tsx";
import { runMermaid } from "./mermaid.ts";
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
    const { currentPath, config, registerHandler, wsRequest } = useContext(websocketContext);

    const details_tags_open = config?.overrides.details_tags_open ?? true;
    const single_file = config?.overrides.single_file;

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
        // const serializer = new XMLSerializer();

        registerHandler("markdown", async (message) => {
            if ("lines" in message) {
                const fileExt = getFileExt(message.currentPath);

                const text = message.lines.join("\n");
                const markdown = fileExt === "md" ? text : "```" + fileExt + `\n${text}`;
                markdownElement.innerHTML = pantsdown.parse(markdown);

                // We find the code-copy <script> generated by pantsdown
                // and create a new <script> element to be appended
                // to the document or else the script is not executed
                const script: HTMLScriptElement =
                    markdownElement.querySelector("#code-copy-script")!;
                const newScript = document.createElement("script");
                newScript.text = script.innerText;
                markdownElement.appendChild(newScript);

                // handle links
                const base = window.location.origin + "/";
                markdownElement.querySelectorAll("a").forEach((element) => {
                    if (!element.href.startsWith(base)) {
                        // if link is not relative, fallback to default behaviour
                        return;
                    }

                    // override onClick on relative links
                    element.addEventListener("click", (event) => {
                        event.preventDefault();
                        const pathname = element.href.slice(base.length);
                        wsRequest({ type: "get_entry", path: pathname });
                    });

                    // overrides applicable to single-file mode
                    if (!single_file) return;

                    // if relative link points to an anchor in currentPath, do nothing
                    // and fallback to default behaviour
                    const currentUrl = window.location.origin + window.location.pathname;
                    if (element.href.slice(currentUrl.length).startsWith("#")) {
                        return;
                    }

                    // add "disabled" tooltip if single-file mode
                    element.style.setProperty("position", "relative");
                    element.classList.add("group");
                    const tooltip = document.createElement("div");
                    tooltip.style.setProperty("position", "absolute");
                    tooltip.style.setProperty("top", "-10px");
                    tooltip.style.setProperty("left", "110%");
                    tooltip.style.setProperty("z-index", "10");

                    const innerHTML =
                        '<div class="group-hover:bg-github-canvas-subtle border group-hover:block rounded-md group-hover:border-orange-600 hidden" style="width: 200px;">' +
                        '<p class="!m-0 p-2 text-sm text-github-fg-default">relative links are disabled in single-file mode.</p>' +
                        "</div>";
                    tooltip.innerHTML = innerHTML;
                    element.appendChild(tooltip);
                });

                if (fileExt === "md") {
                    markdownElement.style.setProperty("padding", "44px");
                    markdownElement.style.setProperty("max-width", "1012px");
                    cursorLineElement.style.removeProperty("transform");
                    lineNumbersElement.style.setProperty("display", "none");
                } else {
                    // rendering code file
                    markdownElement.style.setProperty("padding", "20px 0 0 60px");
                    markdownElement.style.removeProperty("max-width");
                    // move cursorLineElement up so line of code is vertically centered
                    cursorLineElement.style.setProperty("transform", "translateY(-9px)");
                    lineNumbersElement.style.setProperty(
                        "display",
                        message.lines.length ? "block" : "none",
                    );

                    // Change code background color to canvas default when displaying only code
                    const codeContainer = markdownElement.getElementsByTagName("pre")[0];
                    if (codeContainer) {
                        codeContainer.style.setProperty("padding", "0px 16px");
                        codeContainer.style.setProperty(
                            "background",
                            "var(--color-canvas-default)",
                        );
                    }
                }

                await runMermaid();
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
                cursorLineElement={cursorLineElement}
                markdownContainerElement={markdownContainerElement}
            />
            <div id={MARKDOWN_ELEMENT_ID} className="relative mx-auto mb-96" />
            <LineNumbers offsets={offsets} lineNumbersElement={lineNumbersElement} />
        </div>
    );
};
