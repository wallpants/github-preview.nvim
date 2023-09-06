// cspell:ignore softbreak hardbreak
/*
 * https://github.com/iamcco/markdown-preview.nvim/blob/master/app/pages/linenumbers.js
 */
import type MarkdownIt from "markdown-it";
import { type RenderRule } from "markdown-it/lib/renderer";

export function injectLineNumbersPlugin(md: MarkdownIt) {
    const injectLineNumbers: RenderRule = (tokens, idx, options, _env, slf) => {
        let line;
        const token = tokens[idx];
        if (token.map) {
            line = tokens[idx].map?.[0];
            tokens[idx].attrSet("data-source-line", String(line));
        }
        return slf.renderToken(tokens, idx, options);
    };

    md.renderer.rules.paragraph_open = injectLineNumbers;
    md.renderer.rules.heading_open = injectLineNumbers;
    md.renderer.rules.list_item_open = injectLineNumbers;
    md.renderer.rules.table_open = injectLineNumbers;
}
