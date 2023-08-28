import { readFileSync } from "node:fs";
import { dirname, extname, normalize } from "node:path";
import { type RawData } from "ws";
import { type WsBrowserMessage, type WsServerMessage } from "../types";
import { getDirEntries } from "./utils";

function resolveLocalMarkdown(path: string): string {
    const ext = extname(path);
    const content = readFileSync(path).toString();

    if (ext === "md") return content;

    return `\`\`\`${ext}
${content}
\`\`\``;
}

export function onBrowserMessage(
    root: string,
    wsSend: (w: WsServerMessage) => void,
) {
    return async (event: RawData) => {
        const message = JSON.parse(String(event)) as WsBrowserMessage;
        console.log("message: ", message);
        const { currentBrowserEntry } = message;

        if (currentBrowserEntry) {
            const { type, relativeToRoot: _relative } = currentBrowserEntry;
            /* if we're at dir "./src" and navigate to "..",
             * the path becomes "./src/.."
             *
             * normalize converts "./src/.." to "./"
             **/
            const relativeToRoot = normalize(_relative);
            const relativeDir =
                type === "dir" ? relativeToRoot : dirname(relativeToRoot);

            const entries = await getDirEntries({ relativeDir, root });

            let markdown: string | undefined;
            if (type === "file") {
                /** We generate a markdown representation of any file that's
                 * requested by the browser */
                markdown = resolveLocalMarkdown(relativeToRoot);
            }

            wsSend({
                root,
                currentEntry: {
                    relativeToRoot,
                    markdown,
                    type,
                },
                entries,
            });
        }
    };
}
