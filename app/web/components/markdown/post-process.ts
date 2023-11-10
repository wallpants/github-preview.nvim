import { type MutableRefObject } from "react";
import { type WebsocketContext } from "../websocket-provider/context";

export function resolveRelativeLinks({
    wsRequest,
    markdownElement,
    skipScroll,
    single_file,
}: {
    wsRequest: WebsocketContext["wsRequest"];
    markdownElement: HTMLElement;
    skipScroll: MutableRefObject<boolean>;
    single_file: boolean | undefined;
}) {
    const base = window.location.origin + "/";

    // override relative links to trigger wsRequest
    markdownElement.querySelectorAll("a").forEach((element) => {
        const isAbsolute = !element.href.startsWith(base);
        const isAnchor = element.href
            .slice((window.location.origin + window.location.pathname).length)
            .startsWith("#");
        if (isAbsolute || isAnchor) {
            return;
        }

        if (single_file) {
            element.style.setProperty("color", "purple");
            element.style.setProperty("cursor", "not-allowed");
        }

        // override onClick on relative links
        element.addEventListener("click", (event) => {
            event.preventDefault();
            // if single file, cancel default behaviour and do nothing
            if (single_file) return;

            const pathname = element.href.slice(base.length);
            wsRequest({ type: "get_entry", path: pathname });
        });
    });

    // intercept clicks to <details> tags to set a flag to disable scrolling.
    // it's annoying when you open/close a <details> tag and there's an auto scroll
    markdownElement.querySelectorAll("details").forEach((element) => {
        element.addEventListener(
            "click",
            () => {
                skipScroll.current = true;
            },
            {
                capture: true,
            },
        );
    });
}

export function evalPantsdownScript(markdownElement: HTMLElement) {
    // We find the code-copy <script> generated by pantsdown
    // and create a new <script> element to be appended
    // to the document or else the script is not executed
    const script: HTMLScriptElement = markdownElement.querySelector("#code-copy-script")!;
    const newScript = document.createElement("script");
    newScript.text = script.innerText;
    markdownElement.appendChild(newScript);
}

export function updateElementsStyles({
    lines,
    fileExt,
    markdownElement,
    cursorLineElement,
    lineNumbersElement,
}: {
    lines: string[];
    fileExt: string | undefined;
    markdownElement: HTMLElement;
    cursorLineElement: HTMLElement;
    lineNumbersElement: HTMLElement;
}) {
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
        lineNumbersElement.style.setProperty("display", lines.length ? "block" : "none");

        // Change code background color to canvas default when displaying only code
        const codeContainer = markdownElement.getElementsByTagName("pre")[0];
        if (codeContainer) {
            codeContainer.style.setProperty("padding", "0px 16px");
            codeContainer.style.setProperty("background", "var(--color-canvas-default)");
        }
    }
}
