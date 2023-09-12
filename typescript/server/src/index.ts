import { GP_UNIX_SOCKET_PATH, type SocketEvent } from "gpshared";
import { logger } from "./logger";
import { onContentChange } from "./unix-socket/on-content-change";
import { onCursorMove } from "./unix-socket/on-cursor-move";
import { onInit } from "./unix-socket/on-init";
import { type UnixSocketMetadata } from "./unix-socket/types";

// TODO(gualcasas): close webserver when unix socket disconnects
logger.verbose("starting unix socket");

Bun.listen<UnixSocketMetadata>({
    unix: GP_UNIX_SOCKET_PATH,
    socket: {
        async data(unixSocket, rawEvent) {
            const event = JSON.parse(rawEvent.toString()) as SocketEvent;
            logger.verbose("unixSocket event received", event);

            if (event.type === "github-preview-init") await onInit(unixSocket, event.data);

            const browserState = unixSocket.data?.browserState;
            if (!browserState) return;

            if (event.type === "github-preview-cursor-move")
                await onCursorMove(unixSocket, event.data);

            if (event.type === "github-preview-content-change")
                await onContentChange(unixSocket, event.data);
        },
        error(_socket, error) {
            logger.verbose("unixSocket ERROR", error);
        },
    },
});
