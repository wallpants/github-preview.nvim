import { type BrowserState, type WsServerMessage } from "./types";
import { getEntries } from "./utils";

export const browserState: BrowserState = {
    root: "",
    repoName: "",
    entries: [],
    currentPath: "",
    content: "",
};

export async function updateCurrentPath(absPath: string): Promise<WsServerMessage> {
    browserState.currentPath = absPath;
    browserState.entries = await getEntries();

    return {
        currentPath: browserState.currentPath,
        entries: browserState.entries,
    };
}
