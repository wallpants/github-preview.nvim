import "../static/dev-tailwind.css";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { type WsBrowserRequest, type WsServerMessage } from "../../types.ts";
import { websocketContext, type MessageHandler } from "./context.ts";

export const Provider = ({
    children,
    host,
    port,
    is_dev,
}: {
    children: ReactNode;
    host: string;
    port: number;
    is_dev: boolean;
}) => {
    const ws = useRef(
        new ReconnectingWebSocket(`ws://${host}:${port}`, [], {
            maxReconnectionDelay: 1500,
            startClosed: true,
        }),
    );
    const [isSingleFile, setIsSingleFile] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [currentPath, setCurrentPath] = useState<string>();
    const [repoName, setRepoName] = useState<string>("");
    const handlers = useRef(new Map<string, MessageHandler>());

    useEffect(() => {
        // we connect in useEffect hook, to wait for children components
        // to have rendered and registered their onWsMessageHandlers
        is_dev && console.log("connecting websocket");
        ws.current.reconnect();
    }, [is_dev]);

    const wsRequest = useCallback(
        (message: WsBrowserRequest) => {
            is_dev && console.log(`requesting '${message.type}'`, message);
            ws.current.send(JSON.stringify(message));
        },
        [is_dev],
    );

    useEffect(() => {
        // Update url on navigation
        if (currentPath === undefined) return;
        window.history.replaceState({}, "", "/" + currentPath);
    }, [currentPath]);

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
            is_dev && console.log("received:", message);

            if (message.goodbye) {
                window.close();
            }

            if (typeof message.singleFile === "boolean") {
                setIsSingleFile(message.singleFile);
            }

            if (message.repoName !== undefined) {
                setRepoName(message.repoName);
            }

            if (message.currentPath !== undefined) {
                setCurrentPath(message.currentPath);
            }

            handlers.current.forEach((handler) => {
                void handler(message);
            });
        };
    }, [wsRequest, is_dev]);

    const getEntries = useCallback(
        (path: string) => {
            wsRequest({ type: "getEntries", path });
        },
        [wsRequest],
    );

    const navigate = useCallback(
        (path: string) => {
            setCurrentPath(path);
            wsRequest({ type: "getEntry", path });
        },
        [wsRequest],
    );

    const registerHandler = useCallback((id: string, handler: MessageHandler) => {
        handlers.current.set(id, handler);
    }, []);

    return (
        <websocketContext.Provider
            value={{
                isConnected,
                isSingleFile,
                registerHandler,
                currentPath,
                getEntries,
                navigate,
                repoName,
            }}
        >
            {children}
        </websocketContext.Provider>
    );
};
