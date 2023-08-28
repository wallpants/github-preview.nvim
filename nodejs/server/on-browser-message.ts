import { readFileSync } from "node:fs";
import { dirname, extname, normalize } from "node:path";
import { type RawData } from "ws";
import {
    type EntryContent,
    type WsBrowserMessage,
    type WsServerMessage,
} from "../types";
import { getDirEntries, textToMarkdown } from "./utils";

type Args = {
    root: string;
    wsSend: (w: WsServerMessage) => void;
};

export function onBrowserMessage({ root, wsSend }: Args) {
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

            let content: EntryContent | undefined;
            if (type === "file") {
                const fileExt = extname(relativeToRoot);
                const text = readFileSync(relativeToRoot).toString();
                const markdown = textToMarkdown({ text, fileExt });
                content = { markdown, fileExt };
            }

            wsSend({
                root,
                currentEntry: {
                    relativeToRoot,
                    content,
                    type,
                },
                entries,
            });
        }
    };
}
