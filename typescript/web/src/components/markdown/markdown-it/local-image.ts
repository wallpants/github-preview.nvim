/*
 * https://github.com/iamcco/markdown-preview.nvim/blob/master/app/pages/image.js
 */
import { LOCAL_FILE_ROUTE } from "gpshared";
import type MarkdownIt from "markdown-it";
import { type RenderRule } from "markdown-it/lib/renderer";

const resolveHtmlImage: RenderRule = (tokens, idx) => {
    let content = tokens[idx]?.content ?? "";

    content = content.replace(
        /<img\s+([^>]*?)src\s*=\s*(["'])([^\2>]+?)\2([^>]*)>/gm,
        (m, g1, _g2, g3, g4) => {
            if (/^(http|\/\/|data:)/.test(g3 as string)) {
                return m;
            }
            return `<img ${g1}src="${LOCAL_FILE_ROUTE}${encodeURIComponent(g3 as string)}"${g4}>`;
        },
    );

    return content;
};

const resolveImage: RenderRule = (tokens, idx) => {
    const src = tokens[idx]?.attrs?.[0]?.[1] ?? "";
    const alt = tokens[idx]?.content;
    const resAttrs = tokens[idx]?.attrs
        ?.slice(2)
        .reduce((pre, cur) => `${pre} ${cur[0]}=${cur[1]}`, "");
    if (/^(http|\/\/|data:)/.test(src)) {
        return `<img src="${src}" alt="${alt}" ${resAttrs} />`;
    }
    return `<img src="${LOCAL_FILE_ROUTE}${encodeURIComponent(src)}" alt="${alt}" ${resAttrs} />`;
};

export default function localImage(md: MarkdownIt) {
    md.renderer.rules.image = resolveImage;
    md.renderer.rules.html_block = resolveHtmlImage;
    md.renderer.rules.html_inline = resolveHtmlImage;
}
