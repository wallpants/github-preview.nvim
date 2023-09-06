/*
 * https://github.com/digitalmoksha/markdown-it-inject-linenumbers/blob/master/index.js
 */
import type MarkdownIt from "markdown-it";
import { type RenderRule } from "markdown-it/lib/renderer";

function injectLineNumbers(og: RenderRule): RenderRule {
    return (tokens, idx, options, _env, slf) => {
        let line;
        const token = tokens[idx];
        console.log("token: ", token);
        if (token.map) {
            line = tokens[idx].map?.[0];
            console.log("line: ", line);
            tokens[idx].attrSet("data-source-line", String(line));
        }
        return og(tokens, idx, options, _env, slf);
    };
}

export function injectLineNumbersPlugin(md: MarkdownIt) {
    const { fence, paragraph_open, heading_open, list_item_open, table_open } = md.renderer.rules;

    if (fence) md.renderer.rules.fence = injectLineNumbers(fence);
    // if (paragraph_open) md.renderer.rules.paragraph_open = injectLineNumbers(paragraph_open);
    // if (heading_open) md.renderer.rules.heading_open = injectLineNumbers(heading_open);
    // if (list_item_open) md.renderer.rules.list_item_open = injectLineNumbers(list_item_open);
    // if (table_open) md.renderer.rules.table_open = injectLineNumbers(table_open);
}
