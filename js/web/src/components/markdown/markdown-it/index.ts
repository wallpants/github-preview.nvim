import markdownIt from "markdown-it";
// import { toHtml } from "hast-util-to-html";
// import languages from "../../../languages";
import highlightjs from "markdown-it-highlightjs";
import copyBlockPlugin from "./copy-block";
import { injectSourceLines } from "./inject-source-lines";
// import localImage from "./local-image";
// import relativeLinks from "./relative-links";

export function markdownToHtml(markdown: string) {
    const miInstance = markdownIt()
        // .use(localImage)
        // .use(relativeLinks)
        .use(highlightjs)
        .use(injectSourceLines)
        .use(copyBlockPlugin);

    return miInstance.render(markdown);
}
