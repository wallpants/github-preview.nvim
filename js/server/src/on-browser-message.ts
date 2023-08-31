import { isBinary } from "istextorbinary";
import { readFileSync } from "node:fs";
import { dirname, extname, normalize } from "node:path";
import { type RawData } from "ws";
import { type WsBrowserMessage, type WsServerMessage } from "../../types";
import { getDirEntries, textToMarkdown } from "./utils";

interface Args {
    root: string;
    wsSend: (w: WsServerMessage) => void;
}

export function onBrowserMessage({ root, wsSend }: Args) {
    return async (event: RawData) => {
        const message = JSON.parse(String(event)) as WsBrowserMessage;
        const { currentBrowserEntry } = message;

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

        const response: WsServerMessage = {
            root,
            entries,
            currentEntry: { relativeToRoot, type },
        };

        if (type === "file") {
            // TODO: add support for binary files (images, etc)
            if (isBinary(relativeToRoot)) return;

            const fileExt = extname(relativeToRoot);
            const text = readFileSync(relativeToRoot).toString();
            const markdown = textToMarkdown({ text, fileExt });
            response.currentEntry.content = { markdown, fileExt };
        }

        wsSend(response);
    };
}
