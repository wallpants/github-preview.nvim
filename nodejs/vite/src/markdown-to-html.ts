import {
    all,
    createStarryNight,
    type Grammar,
    type Root,
} from "@wooorm/starry-night";
import { toHtml } from "hast-util-to-html";
import markdownIt from "markdown-it";
import copyBlock from "./copy-block";

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
                    ? starryNight!.highlight(value, scope).children
                    : [{ type: "text", value }],
            });
        },
    }).use(copyBlock);

    return markdownItInstance.render(markdown);
}
