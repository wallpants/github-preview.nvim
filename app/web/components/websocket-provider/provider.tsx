import "../../static/dev-tailwind.css";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { type GithubPreview } from "../../../github-preview.ts";
import { type BuildConsts, type WsBrowserMessage, type WsServerMessage } from "../../../types.ts";
import { ThemeProvider } from "../theme-provider.tsx";
import { websocketContext, type MessageHandler } from "./context.ts";

type Props = {
    children: ReactNode;
    BUILD_CONSTS: BuildConsts;
};

export const WebsocketProvider = ({
    children,
    BUILD_CONSTS: { HOST, PORT, IS_DEV, THEME },
}: Props) => {
    const ws = useRef(
        new ReconnectingWebSocket(`ws://${HOST}:${PORT}`, [], {
            maxReconnectionDelay: 1500,
            startClosed: true,
        }),
    );
    const [repoName, setRepoName] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [currentPath, setCurrentPath] = useState<string>();
    const [currentEntries, setCurrentEntries] = useState<string[] | undefined>(undefined);
    const [hash, setHash] = useState<string | null | undefined>(undefined);
    const [config, setConfig] = useState<GithubPreview["config"]>();
    const handlers = useRef(new Map<string, MessageHandler>());

    useEffect(() => {
        // we connect in useEffect hook, to wait for children components
        // to have rendered and registered their onWsMessageHandlers
        IS_DEV && console.log("connecting websocket");
        ws.current.reconnect();
    }, [IS_DEV]);

    const wsRequest = useCallback(
        (message: WsBrowserMessage) => {
            IS_DEV && console.log(`requesting '${message.type}'`, message);
            ws.current.send(JSON.stringify(message));
        },
        [IS_DEV],
    );

    useEffect(() => {
        // Update url on navigation
        if (currentPath === undefined) return;
        window.history.replaceState({}, "", "/" + currentPath);
        if (hash) window.location.hash = hash;
    }, [currentPath, hash]);

    useEffect(() => {
        // Register websocket listeners
        ws.current.onopen = () => {
            setIsConnected(true);
            wsRequest({ type: "init" });
        };
        ws.current.onclose = () => {
            setIsConnected(false);
        };
        ws.current.onmessage = (event) => {
            const message = JSON.parse(String(event.data)) as WsServerMessage;
            IS_DEV && console.log("received:", message);

            if (message.type === "goodbye") {
                window.close();
            }

            if (message.type === "init") {
                setRepoName(message.repoName);
            }

            if ("config" in message) {
                setConfig(message.config);
            }

            if ("lines" in message && message.lines.length) {
                // there's either lines content or currentEntries
                setCurrentEntries(undefined);
            } else if ("currentEntries" in message) {
                setCurrentEntries(message.currentEntries);
            }

            if ("currentPath" in message) {
                setCurrentPath(message.currentPath);
            }

            if ("hash" in message) {
                setHash(message.hash);
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
                currentEntries,
                currentPath,
                isConnected,
                wsRequest,
                repoName,
                setHash,
                config,
                hash,
            }}
        >
            <ThemeProvider THEME={THEME}>{children}</ThemeProvider>
        </websocketContext.Provider>
    );
};
