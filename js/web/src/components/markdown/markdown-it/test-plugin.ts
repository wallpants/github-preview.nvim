import type MarkdownIt from "markdown-it";

export function testPlugin(md: MarkdownIt) {
    console.log("renderer rules: ", Object.keys(md.renderer.rules));
}
