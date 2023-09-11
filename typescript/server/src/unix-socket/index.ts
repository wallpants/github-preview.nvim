import { GP_UNIX_SOCKET_PATH, type SocketEvent } from "@gp/shared";
import { onContentChange } from "./on-content-change";
import { onCursorMove } from "./on-cursor-move";
import { onInit } from "./on-init";
import { type UnixSocketMetadata } from "./types";

export function startUnixSocket() {
    return Bun.listen<UnixSocketMetadata>({
        unix: GP_UNIX_SOCKET_PATH,
        socket: {
            async data(unixSocket, rawEvent) {
                const event = JSON.parse(rawEvent.toString()) as SocketEvent;
                console.debug(event);

                if (event.type === "github-preview-init") await onInit(unixSocket, event.data);

                const browserState = unixSocket.data?.browserState;
                if (!browserState) return;

                if (event.type === "github-preview-cursor-move")
                    await onCursorMove(unixSocket, event.data);

                if (event.type === "github-preview-content-change")
                    await onContentChange(unixSocket, event.data);
            },
            error(_socket, error) {
                console.log("server says: error");
                throw error;
            },
        },
    });
}
