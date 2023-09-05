// cspell:ignore softbreak hardbreak
/*
 * https://github.com/iamcco/markdown-preview.nvim/blob/master/app/pages/linenumbers.js
 */
import type MarkdownIt from "markdown-it";
import { type RenderRule } from "markdown-it/lib/renderer";

export function injectLineNumbersPlugin(md: MarkdownIt) {
    const injectLineNumbers =
        (rule: string): RenderRule =>
        (tokens, idx, options, _env, slf) => {
            let line;
            const token = tokens[idx];
            // console.log("idx: ", idx);
            // console.log("rule: ", rule);
            // console.log("token: ", token);
            if (token.map) {
                line = tokens[idx].map?.[0];
                // console.log("line: ", line);
                tokens[idx].attrSet("data-source-line", String(line));
                tokens[idx].attrSet("data-source-line-rule", rule);
            }
            console.log("--------------");
            return slf.renderToken(tokens, idx, options);
        };

    md.renderer.rules.code_block = injectLineNumbers("code_block");
    md.renderer.rules.image = injectLineNumbers("image");
    md.renderer.rules.hardbreak = injectLineNumbers("hardbreak");
    md.renderer.rules.softbreak = injectLineNumbers("softbreak");
    md.renderer.rules.html_block = injectLineNumbers("html_block");
    md.renderer.rules.html_inline = injectLineNumbers("html_inline");
    md.renderer.rules.paragraph_open = injectLineNumbers("paragraph_open");
    md.renderer.rules.heading_open = injectLineNumbers("heading_open");
    md.renderer.rules.list_item_open = injectLineNumbers("list_item_open");
    md.renderer.rules.table_open = injectLineNumbers("table_open");

    // Enabling this causes rendering problems with the markdown
    // md.renderer.rules.code_inline = injectLineNumbers("code_inline");
    // md.renderer.rules.fence = injectLineNumbers("fence");
    // md.renderer.rules.text = injectLineNumbers("text");
}
