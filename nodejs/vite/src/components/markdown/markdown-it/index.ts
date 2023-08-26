import {
    all,
    createStarryNight,
    type Grammar,
    type Root,
} from "@wooorm/starry-night";
import { toHtml } from "hast-util-to-html";
import markdownIt from "markdown-it";
import copyBlockPlugin from "./copy-block";
import { starryNightGutter } from "./gutter";
import injectLinenumbersPlugin from "./linenumbers";
import localImage from "./local-image";
import relativeLinks from "./relative-links";

type StarryNight = {
    flagToScope: (flag: string) => string | undefined;
    highlight: (value: string, scope: string) => Root;
    missingScopes: () => Array<string>;
    register: (grammars: Array<Grammar>) => Promise<undefined>;
    scopes: () => Array<string>;
};

let starryNight: StarryNight | null = null;

export async function markdownToHtml(markdown: string) {
    if (!starryNight) starryNight = await createStarryNight(all);

    const markdownItInstance = markdownIt({
        highlight(value, lang) {
            const scope = starryNight!.flagToScope(lang);

            return toHtml({
                type: "element",
                tagName: "pre",
                properties: {
                    className: scope
                        ? [
                              "highlight",
                              "highlight-" +
                                  scope
                                      .replace(/^source\./, "")
                                      .replace(/\./g, "-"),
                          ]
                        : undefined,
                },
                // eslint-disable-next-line
                // @ts-ignore
                children: scope
                    ? starryNightGutter(starryNight!.highlight(value, scope))
                          .children
                    : [{ type: "text", value }],
            });
        },
    })
        .use(copyBlockPlugin)
        .use(localImage)
        .use(injectLinenumbersPlugin)
        .use(relativeLinks);

    return markdownItInstance.render(markdown);
}
