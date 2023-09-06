import type MarkdownIt from "markdown-it";
import { type RenderRule } from "markdown-it/lib/renderer";

function addRule(ogRenderRule?: RenderRule): RenderRule {
    return (tokens, idx, options, env, slf) => {
        const line = tokens[idx].map?.[0];
        if (line !== undefined) {
            tokens[idx].attrSet("data-source-line", String(line));

            const endLine = tokens[idx].map?.[1];
            if (endLine && endLine > line + 1) {
                tokens[idx].attrSet("data-source-line-end", String(endLine));
            }
        }

        // if we don't do this, "fence" code doesn't render
        return ogRenderRule
            ? ogRenderRule(tokens, idx, options, env, slf)
            : slf.renderToken(tokens, idx, options);
    };
}

export function injectSourceLines(md: MarkdownIt) {
    const rules = ["fence", "paragraph_open", "heading_open", "list_item_open", "table_open"];

    rules.forEach((rule) => {
        md.renderer.rules[rule] = addRule(md.renderer.rules[rule]);
    });
}
