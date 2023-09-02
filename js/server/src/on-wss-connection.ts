import type ipc from "node-ipc";
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { type WebSocket } from "ws";
import { type EntryContent, type PluginConfig, type WsServerMessage } from "./types";
import { getEntries, getRepoName, textToMarkdown } from "./utils";

interface Args {
    props: PluginConfig;
    ipc: typeof ipc;
}

const browserState = {
    currentPath: "",
};

export function onWssConnection({ props }: Args) {
    return async (ws: WebSocket) => {
        function wsSend(m: WsServerMessage) {
            ws.send(JSON.stringify(m));
        }

        const isDir = props.init_path.endsWith("/");
        let content: EntryContent | undefined;

        if (!isDir) {
            const text = readFileSync(props.init_path).toString();
            const fileExt = extname(props.init_path);
            const markdown = textToMarkdown({ text, fileExt });
            content = {
                fileExt,
                markdown,
            };
        } else {
            // TODO(gualcasas): search for base README.md if we're in a dir
        }

        const repoName = getRepoName(props.root);
        const initialMessage: WsServerMessage = {
            root: props.root,
            repoName: repoName,
            entries: await getEntries(props.init_path),
            currentEntry: {
                absPath: props.init_path,
                content,
            },
        };

        wsSend(initialMessage);
        browserState.currentPath = props.init_path;

        // const contentChangeEvent: (typeof IPC_EVENTS)[number] = "github-preview-content-change";
        // ipc.server.on(contentChangeEvent, async (contentChange: ContentChange, _socket: Socket) => {
        //     devSafeParse(logger, ContentChangeSchema, contentChange);
        //     logger.verbose(contentChangeEvent, contentChange);

        //     const fileExt = extname(contentChange.abs_file_path);
        //     const relativeToRoot = relative(props.root, contentChange.abs_file_path);

        //     const message: WsServerMessage = {
        //         currentEntry: {
        //             type: "file",
        //             relativeToRoot,
        //             content: {
        //                 fileExt,
        //                 markdown: textToMarkdown({ text: contentChange.content, fileExt }),
        //             },
        //         },
        //     };

        //     if (browserState.relativeToRoot !== relativeToRoot) {
        //         // only send "entries" if currentDir (aka relativeToRoot) has changed
        //         browserState.relativeToRoot = relativeToRoot;
        //         message.entries = await getDirEntries({
        //             root: props.root,
        //             relativeDir: dirname(relativeToRoot),
        //         });
        //     }

        //     wsSend(message);
        // });

        // const cursorMoveEvent: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";
        // ipc.server.on(cursorMoveEvent, function (cursorMove: CursorMove, _socket: Socket) {
        //     devSafeParse(logger, CursorMoveSchema, cursorMove);
        //     logger.verbose(cursorMoveEvent, cursorMove);
        //     wsSend({
        //         root,
        //         cursorMove,
        //         currentEntry,
        //         entries,
        //         repoName,
        //     });
        // });

        // const relativeToRoot = relative(root, await buffer.name);
        // const fileExt = extname(relativeToRoot);
        // const currentEntry: CurrentEntry = {
        //     relativeToRoot,
        //     type: "file",
        //     content: {
        //         markdown: textToMarkdown({ text, fileExt }),
        //         fileExt,
        //     },
        // };

        // const entries = await getDirEntries({
        //     relativeDir: dirname(relativeToRoot),
        //     root,
        // });

        // wsSend({
        //     root,
        //     cursorMove,
        //     currentEntry,
        //     entries,
        //     repoName,
        // });

        // ws.on("message", onBrowserMessage({ root: props.root, wsSend }));
    };
}
