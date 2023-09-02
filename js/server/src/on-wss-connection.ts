import type ipc from "node-ipc";
import { type Socket } from "node:net";
import { dirname, extname, relative } from "node:path";
import { type WebSocket } from "ws";
import { type IPC_EVENTS } from "./consts";
import { logger } from "./logger";
import { onBrowserMessage } from "./on-browser-message";
import {
    ContentChangeSchema,
    CursorMoveSchema,
    type ContentChange,
    type CurrentEntry,
    type CursorMove,
    type PluginProps,
    type WsServerMessage,
} from "./types";
import { devSafeParse, getDirEntries, getRepoName, textToMarkdown } from "./utils";

interface Args {
    props: PluginProps;
    ipc: typeof ipc;
}

const browserState = {
    repoName: "",
    relativeToRoot: "",
};

export function onWssConnection({ props, ipc }: Args) {
    const repoName = getRepoName(props.root);

    return async (ws: WebSocket) => {
        const wsSend = (m: WsServerMessage) => {
            ws.send(JSON.stringify(m));
        };

        wsSend({ repoName });
        browserState.repoName = repoName;

        const contentChangeEvent: (typeof IPC_EVENTS)[number] = "github-preview-content-change";
        ipc.server.on(contentChangeEvent, async (contentChange: ContentChange, _socket: Socket) => {
            devSafeParse(logger, ContentChangeSchema, contentChange);
            logger.verbose(contentChangeEvent, contentChange);

            const fileExt = extname(contentChange.abs_file_path);
            const relativeToRoot = relative(props.root, contentChange.abs_file_path);

            const message: WsServerMessage = {
                currentEntry: {
                    type: "file",
                    relativeToRoot,
                    content: {
                        fileExt,
                        markdown: textToMarkdown({ text: contentChange.content, fileExt }),
                    },
                },
            };

            if (browserState.relativeToRoot !== relativeToRoot) {
                // only send "entries" if currentDir (aka relativeToRoot) has changed
                browserState.relativeToRoot = relativeToRoot;
                message.entries = await getDirEntries({
                    root: props.root,
                    relativeDir: dirname(relativeToRoot),
                });
            }

            wsSend(message);
        });

        const cursorMoveEvent: (typeof IPC_EVENTS)[number] = "github-preview-cursor-move";
        ipc.server.on(cursorMoveEvent, function (cursorMove: CursorMove, _socket: Socket) {
            devSafeParse(logger, CursorMoveSchema, cursorMove);
            logger.verbose(cursorMoveEvent, cursorMove);
            wsSend({
                root,
                cursorMove,
                currentEntry,
                entries,
                repoName,
            });
        });

        const relativeToRoot = relative(root, await buffer.name);
        const fileExt = extname(relativeToRoot);
        const currentEntry: CurrentEntry = {
            relativeToRoot,
            type: "file",
            content: {
                markdown: textToMarkdown({ text, fileExt }),
                fileExt,
            },
        };

        const entries = await getDirEntries({
            relativeDir: dirname(relativeToRoot),
            root,
        });

        wsSend({
            root,
            cursorMove,
            currentEntry,
            entries,
            repoName,
        });

        ws.on("message", onBrowserMessage({ root, wsSend }));
    };
}
