import markdownIt from "markdown-it";
import highlightjs from "markdown-it-highlightjs";
import { type BrowserState } from "../../../types.ts";
import copyBlockPlugin from "./copy-block.ts";
import { sourceLineNumbers } from "./source-line-numbers.ts";

function markdownToHtml(markdown: string) {
    const miInstance = markdownIt().use(highlightjs).use(sourceLineNumbers).use(copyBlockPlugin);

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
