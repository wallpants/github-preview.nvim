import { basename } from "node:path";
import { type WsServerMessage } from "../types";
import { getEntries, getRepoName, makeCurrentEntry } from "../utils";
import { type HandlerArgs } from "./on-content-change";

export async function initMessage({ config, browserState, wsSend }: HandlerArgs) {
    const absPath = config.init_path;
    const initEntries = await getEntries({ browserState, absPath, root: config.root });
    let initCurrentEntry = makeCurrentEntry({ absPath });

    if (!initCurrentEntry.content) {
        // search for README.md in current dir
        const readmePath = initEntries?.find((e) => basename(e).toLowerCase() === "readme.md");
        if (readmePath) initCurrentEntry = makeCurrentEntry({ absPath: readmePath });
    }

    const initialMessage: WsServerMessage = {
        root: config.root,
        repoName: getRepoName(config.root),
        entries: initEntries,
        currentEntry: initCurrentEntry,
    };

    wsSend(initialMessage);
    browserState.currentEntry = initialMessage.currentEntry?.absPath ?? "";
}
