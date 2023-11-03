import "../../static/dev-tailwind.css";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { type GithubPreview } from "../../../github-preview.ts";
import { type WsBrowserMessage, type WsServerMessage } from "../../../types.ts";
import { websocketContext, type MessageHandler } from "./context.ts";

export const WebsocketProvider = ({
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
    const [repoName, setRepoName] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [currentPath, setCurrentPath] = useState<string>();
    const [config, setConfig] = useState<GithubPreview["config"]>();
    const handlers = useRef(new Map<string, MessageHandler>());

    useEffect(() => {
        // we connect in useEffect hook, to wait for children components
        // to have rendered and registered their onWsMessageHandlers
        is_dev && console.log("connecting websocket");
        ws.current.reconnect();
    }, [is_dev]);

    const wsRequest = useCallback(
        (message: WsBrowserMessage) => {
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

            if (message.type === "goodbye") {
                window.close();
            }

            if (message.type === "init") {
                setRepoName(message.repoName);
            }

            if ("config" in message) {
                setConfig(message.config);
            }

            if ("currentPath" in message) {
                setCurrentPath(message.currentPath);
            }

            handlers.current.forEach((handler) => {
                void handler(message);
            });
        };
    }, [wsRequest, is_dev]);

    const registerHandler = useCallback((id: string, handler: MessageHandler) => {
        handlers.current.set(id, handler);
    }, []);

    return (
        <websocketContext.Provider
            value={{
                isConnected,
                registerHandler,
                currentPath,
                wsRequest,
                repoName,
                config,
            }}
        >
            {children}
        </websocketContext.Provider>
    );
};
