import type MarkdownIt from "markdown-it";
import { type RenderRule } from "markdown-it/lib/renderer";

import Clipboard from "clipboard";
const clipboard = new Clipboard(".markdown-it-copy-block");

clipboard.on("success", function (e) {
    const successEl = e.trigger.nextElementSibling as HTMLSpanElement;
    if (successEl) {
        successEl.style.setProperty("display", "inline");
        setTimeout(() => {
            successEl.style.setProperty("display", "none");
        }, 1000);
    }
    e.clearSelection();
});

function renderCode(origRule: RenderRule): RenderRule {
    return function (...args) {
        const [tokens, idx] = args;
        const content = tokens[idx].content
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&lt;");
        const origRendered = origRule(...args);

        if (content.length === 0) return origRendered;

        return `
<div style="position: relative">
	${origRendered}
    <div class="copy-button-container">
        <button class="markdown-it-copy-block" data-clipboard-text="${content}">
            Copy
        </button>
        <span class="copied">copied</span>
    </div>
</div>
`;
    };
}

export default function (md: MarkdownIt) {
    const { code_block, fence } = md.renderer.rules;
    if (code_block) {
        md.renderer.rules.code_block = renderCode(code_block);
    }

    if (fence) {
        md.renderer.rules.fence = renderCode(fence);
    }
}
