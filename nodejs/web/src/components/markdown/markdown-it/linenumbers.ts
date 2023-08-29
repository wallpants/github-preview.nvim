/*
 * https://github.com/digitalmoksha/markdown-it-inject-linenumbers/blob/master/index.js
 */
import type MarkdownIt from "markdown-it";
import { type RenderRule } from "markdown-it/lib/renderer";

export default function injectLinenumbersPlugin(md: MarkdownIt) {
    //
    // Inject line numbers for sync scroll. Notes:
    //
    // - We track only headings and paragraphs, at any level.
    // - TODO Footnotes content causes jumps. Level limit filters it automatically.
    const injectLineNumbers: RenderRule = (tokens, idx, options, _env, slf) => {
        let line;
        // if (tokens[idx].map && tokens[idx].level === 0) {
        if (tokens[idx].map) {
            line = tokens[idx].map?.[0];
            tokens[idx].attrJoin("class", "source-line");
            tokens[idx].attrSet("data-source-line", String(line));
        }
        return slf.renderToken(tokens, idx, options);
    };

    md.renderer.rules.paragraph_open = injectLineNumbers;
    md.renderer.rules.heading_open = injectLineNumbers;
    md.renderer.rules.list_item_open = injectLineNumbers;
    md.renderer.rules.table_open = injectLineNumbers;
}
