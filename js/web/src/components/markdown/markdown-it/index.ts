import { createStarryNight } from "@wooorm/starry-night";
import { toHtml } from "hast-util-to-html";
import markdownIt from "markdown-it";
import languages from "../../../languages";
import copyBlockPlugin from "./copy-block";
import { starryNightGutter } from "./gutter";
import { injectLineNumbersPlugin } from "./line-numbers";
import localImage from "./local-image";
import relativeLinks from "./relative-links";
import { testPlugin } from "./test-plugin";

const starryNight = await createStarryNight(languages);

export function markdownToHtml(markdown: string) {
    const markdownItInstance = markdownIt({
        highlight(value, lang) {
            const scope = starryNight.flagToScope(lang) ?? "";

            // eslint-disable-next-line
            const gutterChildren: any[] = starryNightGutter(
                starryNight.highlight(value, scope),
            ).children;

            return toHtml({
                type: "element",
                tagName: "pre",
                properties: {
                    className: scope
                        ? [
                              "highlight",
                              "highlight-" + scope.replace(/^source\./, "").replace(/\./g, "-"),
                          ]
                        : undefined,
                },
                // eslint-disable-next-line
                children: scope ? gutterChildren : [{ type: "text", value }],
            });
        },
    })
        .use(copyBlockPlugin)
        .use(localImage)
        .use(injectLineNumbersPlugin)
        .use(relativeLinks)
        .use(testPlugin);

    return markdownItInstance.render(markdown);
}
