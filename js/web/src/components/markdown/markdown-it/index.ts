import markdownIt from "markdown-it";
import highlightjs from "markdown-it-highlightjs";
// import copyBlockPlugin from "./copy-block";
// import { toHtml } from "hast-util-to-html";
// import languages from "../../../languages";
// import { starryNightGutter } from "./gutter";
// import { injectLineNumbersPlugin } from "./line-numbers";
// import localImage from "./local-image";
// import relativeLinks from "./relative-links";

// const starryNight = await createStarryNight(languages);

export function markdownToHtml(markdown: string) {
    const markdownItInstance = markdownIt()
        // .use(copyBlockPlugin)
        // .use(localImage)
        // .use(injectLineNumbersPlugin)
        // .use(relativeLinks)
        .use(highlightjs);

    return markdownItInstance.render(markdown);
}
