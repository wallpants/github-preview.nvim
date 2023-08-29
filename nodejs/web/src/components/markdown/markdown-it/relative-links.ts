import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token";
import { LOCAL_FILE_ROUTE } from "../../../../../consts";

function resolveRelative(token: Token) {
    const href = token.attrGet("href");
    if (!href?.startsWith("http://") && !href?.startsWith("https://")) {
        token.attrSet("href", `${LOCAL_FILE_ROUTE}${href}`);
    }
}

export default function relativeLinks(md: MarkdownIt) {
    md.core.ruler.push("relative-links", function (state) {
        state.tokens.forEach(function (token) {
            if (token.children?.length) {
                token.children.forEach(function (token) {
                    if (token.type === "link_open") resolveRelative(token);
                });
            }
        });
        return false;
    });
}
