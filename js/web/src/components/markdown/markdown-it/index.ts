import markdownIt from "markdown-it";
import highlightjs from "markdown-it-highlightjs";
import copyBlockPlugin from "./copy-block";
// import { toHtml } from "hast-util-to-html";
// import languages from "../../../languages";
// import { injectLineNumbersPlugin } from "./line-numbers";
// import localImage from "./local-image";
// import relativeLinks from "./relative-links";

export function markdownToHtml(markdown: string) {
    const miInstance = markdownIt()
        .use(copyBlockPlugin)
        // .use(localImage)
        // .use(injectLineNumbersPlugin)
        // .use(relativeLinks)
        .use(highlightjs);

    return miInstance.render(markdown);
}
