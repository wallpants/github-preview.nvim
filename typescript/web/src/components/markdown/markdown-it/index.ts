import markdownIt from "markdown-it";
// import { toHtml } from "hast-util-to-html";
// import languages from "../../../languages";
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
    content: string | null;
    fileExt: string | undefined;
}): string {
    if (content === null) return "";
    const markdown = fileExt === "md" ? content : "```" + fileExt + `\n${content}`;
    return markdownToHtml(markdown);
}
