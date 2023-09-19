import markdownIt from "markdown-it";
// import { toHtml } from "hast-util-to-html";
// import languages from "../../../languages";
import { type BrowserState } from "@gp/shared";
import highlightjs from "markdown-it-highlightjs";
import copyBlockPlugin from "./copy-block.ts";
import { sourceLineNumbers } from "./source-line-numbers.ts";
// import localImage from "./local-image";
// import relativeLinks from "./relative-links";

function markdownToHtml(markdown: string) {
    const miInstance = markdownIt()
        // .use(localImage)
        // .use(relativeLinks)
        .use(highlightjs)
        .use(sourceLineNumbers)
        .use(copyBlockPlugin);

    return miInstance.render(markdown);
}

export function contentToHtml({
    content,
    fileExt,
}: {
    content: BrowserState["content"];
    fileExt: string | undefined;
}): string {
    if (!content.length) return "";
    const text = content.join("\n");
    const markdown = fileExt === "md" ? text : "```" + fileExt + `\n${text}`;
    return markdownToHtml(markdown);
}
