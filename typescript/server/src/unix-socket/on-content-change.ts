import { ContentChangeSchema, ENV, type ContentChange, type WsServerMessage } from "@gp/shared";
import { type Socket } from "bun";
import { parse } from "valibot";
import { getEntries } from "../utils.ts";
import { EDITOR_EVENTS_TOPIC } from "../web-server/index.ts";
import { type UnixSocketMetadata } from "./types.ts";

export async function onContentChange(
    unixSocket: Socket<UnixSocketMetadata>,
    contentChange: ContentChange,
) {
    ENV.IS_DEV && parse(ContentChangeSchema, contentChange);
    const browserState = unixSocket.data?.browserState;
    if (!browserState) return;

    browserState.content = contentChange.content;

    const message: WsServerMessage = {
        currentPath: contentChange.abs_path,
        content: contentChange.content,
    };

    const currentPathChanged = browserState.currentPath !== contentChange.abs_path;

    if (currentPathChanged) {
        browserState.currentPath = contentChange.abs_path;
        browserState.entries = await getEntries({
            root: browserState.root,
            currentPath: contentChange.abs_path,
        });

        message.entries = browserState.entries;
    }

    unixSocket.data?.webServer?.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}
