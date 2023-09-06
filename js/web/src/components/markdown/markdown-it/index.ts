import markdownIt from "markdown-it";
// import { toHtml } from "hast-util-to-html";
// import languages from "../../../languages";
import highlightjs from "markdown-it-highlightjs";
import { injectLineNumbersPlugin } from "./line-numbers";
// import localImage from "./local-image";
// import relativeLinks from "./relative-links";

export function markdownToHtml(markdown: string) {
    const miInstance = markdownIt()
        // .use(localImage)
        .use(highlightjs)
        // .use(copyBlockPlugin);
        .use(injectLineNumbersPlugin);
    // .use(relativeLinks)

    return miInstance.render(markdown);
}
