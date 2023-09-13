import { ContentChangeSchema, ENV, type ContentChange } from "@gp/shared";
import { type Socket } from "bun";
import { parse } from "valibot";
import { updateBrowserState } from "../utils.ts";
import { EDITOR_EVENTS_TOPIC } from "../web-server/index.ts";
import { type UnixSocketMetadata } from "./types.ts";

export async function onContentChange(
    unixSocket: Socket<UnixSocketMetadata>,
    contentChange: ContentChange,
) {
    ENV.IS_DEV && parse(ContentChangeSchema, contentChange);
    const browserState = unixSocket.data?.browserState;
    if (!browserState) return;
    const message = await updateBrowserState(
        browserState,
        contentChange.abs_path,
        browserState.cursorLine,
        contentChange.content,
    );
    unixSocket.data?.webServer?.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
}
