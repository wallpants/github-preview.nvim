import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { type GithubPreview } from "../../../github-preview.ts";
import { type BuildConsts, type WsBrowserMessage, type WsServerMessage } from "../../../types.ts";
import { ThemeProvider } from "../theme-provider.tsx";
import { websocketContext, type MessageHandler, type RefObject } from "./context.ts";

type Props = {
    children: ReactNode;
    BUILD_CONSTS: BuildConsts;
};

function createWs(host: string, port: number) {
    return new ReconnectingWebSocket(`ws://${host}:${port}`, [], {
        maxReconnectionDelay: 1500,
        startClosed: true,
    });
}

export const WebsocketProvider = ({
    children,
    BUILD_CONSTS: { HOST, PORT, IS_DEV, THEME },
}: Props) => {
    const [config, setConfig] = useState<GithubPreview["config"] | null>(null);
    const [currentPath, setCurrentPath] = useState<string | null>(null);
    const handlers = useRef(new Map<string, MessageHandler>());
    const [repoName, setRepoName] = useState("");

    /** changes to values in this refObject don't trigger re-renders */
    const refObject = useRef<RefObject>({
        urlMasks: new Map(),
        currentEntries: undefined,
        ws: createWs(HOST, PORT),
        skipScroll: false,
        hash: {
            value: undefined,
            lineStart: undefined,
            lineEnd: undefined,
        },
    });

    useEffect(() => {
        // we connect in useEffect hook, to wait for children components
        // to have rendered and registered their onWsMessageHandlers
        IS_DEV && console.log("connecting websocket");
        refObject.current.ws.reconnect();
    }, [IS_DEV]);

    const wsRequest = useCallback(
        (message: WsBrowserMessage) => {
            IS_DEV && console.log(`requesting '${message.type}'`, message);
            refObject.current.ws.send(JSON.stringify(message));
        },
        [IS_DEV],
    );

    useEffect(() => {
        // Register websocket listeners
        refObject.current.ws.onopen = () => {
            wsRequest({ type: "init" });
        };
        refObject.current.ws.onmessage = (event) => {
            const message = JSON.parse(String(event.data)) as WsServerMessage;
            IS_DEV && console.log("received:", message);

            if (message.type === "goodbye") {
                !IS_DEV && window.close();
            }

            if ("repoName" in message) setRepoName(message.repoName);
            if ("config" in message) setConfig(message.config);

            if ("currentEntries" in message) {
                refObject.current.currentEntries = message.currentEntries;
            }

            if ("currentPath" in message) {
                window.history.replaceState({}, "", "/" + message.currentPath);
                setCurrentPath(message.currentPath);
            }

            if ("hash" in message) {
                refObject.current.hash.value = message.hash;

                const lineRangeRegexp = /^L(\d+)(?:-L(\d+))?$/;
                const match = message.hash && lineRangeRegexp.exec(message.hash);

                if (match) {
                    refObject.current.hash.lineStart = Number(match[1]);
                    if (match[2]) refObject.current.hash.lineEnd = Number(match[2]);
                } else {
                    refObject.current.hash.lineStart = undefined;
                    refObject.current.hash.lineEnd = undefined;
                }
            }

            handlers.current.forEach((handler) => {
                void handler(message);
            });
        };
    }, [wsRequest, IS_DEV]);

    const registerHandler = useCallback((id: string, handler: MessageHandler) => {
        handlers.current.set(id, handler);
    }, []);

    return (
        <websocketContext.Provider
            value={{
                registerHandler,
                wsRequest,
                currentPath,
                repoName,
                config,
                refObject,
            }}
        >
            <ThemeProvider THEME={THEME}>{children}</ThemeProvider>
        </websocketContext.Provider>
    );
};
