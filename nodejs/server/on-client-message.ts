import { dirname, normalize } from "node:path";
import { type RawData } from "ws";
import { type WsClientMessage, type WsServerMessage } from "../types";
import { getDirEntries } from "./utils";

type Args = {
    root: string;
    wsSend: (w: WsServerMessage) => void;
};

export function onClientMessage({ wsSend, root }: Args) {
    return async (event: RawData) => {
        const message = JSON.parse(String(event)) as WsClientMessage;
        const { entry } = message;
        if (entry) {
            const normalizedEntry = {
                ...entry,
                // if we're at dir "./src" and navigate to "..",
                // the path becomes "./src/.."
                //
                // normalize converts "./src/.." to "./"
                relativeToRoot: normalize(entry.relativeToRoot),
            };
            const relativeDir =
                entry.type === "dir"
                    ? entry.relativeToRoot
                    : dirname(entry.relativeToRoot);

            const entries = await getDirEntries({ relativeDir, root });

            let markdown: string | undefined;
            if (entry.type === "file") {
                markdown = "";
            }

            wsSend({ root, markdown, entries, entry: normalizedEntry });
        }
    };
}
