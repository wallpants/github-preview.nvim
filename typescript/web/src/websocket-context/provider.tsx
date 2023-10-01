import { type WsBrowserRequest, type WsServerMessage } from "@gp/shared";
import { createBrowserHistory } from "history";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { ENV } from "../env.ts";
import { websocketContext, type MessageHandler } from "./context.ts";

const URL = "ws://" + (ENV.IS_DEV ? `localhost:${ENV.VITE_GP_WS_PORT}` : window.location.host);
const ws = new ReconnectingWebSocket(URL, [], {
    maxReconnectionDelay: 1500,
    startClosed: true,
});

const history = createBrowserHistory();

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [currentPath, setCurrentPath] = useState<string>();
    const [repoName, setRepoName] = useState<string>("");
    const handlers = useRef(new Map<string, MessageHandler>());

    useEffect(() => {
        // we connect in useEffect hook, to wait for children components
        // to have rendered and registered their onWsMessageHandlers
        if (ENV.IS_DEV) console.log("connecting websocket");
        ws.reconnect();
    }, []);

    const wsRequest = useCallback((message: WsBrowserRequest) => {
        if (ENV.IS_DEV) console.log(`requesting '${message.type}'`, message);
        ws.send(JSON.stringify(message));
    }, []);

    useEffect(() => {
        // Update url on navigation
        if (currentPath === undefined) return;
        history.replace("/" + currentPath);
    }, [currentPath]);

    useEffect(() => {
        // Register websocket listeners
        ws.onopen = () => {
            setIsConnected(true);
            wsRequest({ type: "init" });
        };
        ws.onclose = () => {
            setIsConnected(false);
        };
        ws.onmessage = (event) => {
            const message = JSON.parse(String(event.data)) as WsServerMessage;
            if (ENV.IS_DEV) console.log("received:", message);

            if (message.goodbye) {
                window.close();
            }

            if (message.repoName !== undefined) {
                setRepoName(message.repoName);
            }

            if (message.currentPath !== undefined) {
                setCurrentPath(message.currentPath);
            }

            handlers.current.forEach((handler) => {
                handler(message);
            });
        };
    }, [wsRequest]);

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
