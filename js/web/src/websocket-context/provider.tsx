import { createBrowserHistory } from "history";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { ENV } from "../../env";
import { Banner } from "../components/banner";
import { type SyncScrollType, type WsBrowserRequest, type WsServerMessage } from "../types";
import { getFileName } from "../utils";
import { websocketContext, type MessageHandler, type Status } from "./context";

const URL =
    "ws://" + (ENV.VITE_GP_IS_DEV ? `localhost:${ENV.VITE_GP_WS_PORT}` : window.location.host);

const ws = new ReconnectingWebSocket(URL, [], {
    maxReconnectionDelay: 3000,
    // start websocket in CLOSED state, call `.reconnect()` to connect
    startClosed: true,
});

const history = createBrowserHistory();
const messageHandlers = new Map<string, MessageHandler>();

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    const [root, setRoot] = useState<string>();
    const [entries, setEntries] = useState<string[]>();
    const [repoName, setRepoName] = useState<string>();
    const [status, setStatus] = useState<Status>("offline");
    const [currentPath, setCurrentPath] = useState<string>();
    const [syncScrollType, setSyncScrollType] = useState<SyncScrollType>();

    useEffect(() => {
        // we connect in useEffect hook, to wait for children components
        // to have rendered and registered their onWsMessageHandlers
        if (ENV.VITE_GP_IS_DEV) console.log("connecting websocket");
        ws.reconnect();
    }, []);

    const wsRequest = useCallback((message: WsBrowserRequest) => {
        if (ENV.VITE_GP_IS_DEV) console.log(`requesting '${message.type}'`, message);
        ws.send(JSON.stringify(message));
    }, []);

    // Register websocket listeners
    useEffect(() => {
        ws.onopen = () => {
            if (ENV.VITE_GP_IS_DEV) console.log("websocket connected");
            setStatus("online");
            wsRequest({ type: "init" });
        };
        ws.onclose = () => {
            setStatus("reconnecting");
        };
        ws.onmessage = (event) => {
            const message = JSON.parse(String(event.data)) as WsServerMessage;
            if (ENV.VITE_GP_IS_DEV) console.log("received:", message);

            if (message.goodbye) window.close();
            if (message.root) setRoot(message.root);
            if (message.entries) setEntries(message.entries);
            if (message.repoName) setRepoName(message.repoName);
            if (message.syncScrollType) setSyncScrollType(message.syncScrollType);
            if (message.currentPath) {
                // root must either already be in state
                // or it must be present in the current message
                const safeRoot = message.root ?? root;
                if (!safeRoot) throw Error("root missing");
                const relative = message.currentPath.slice(safeRoot.length);
                history.push("/" + relative);
                setCurrentPath(message.currentPath);
            }

            const fileName = getFileName(message.currentPath ?? currentPath);
            messageHandlers.forEach((handler) => {
                handler(message, fileName, syncScrollType);
            });
        };
    }, [wsRequest, currentPath, root, syncScrollType]);

    const addMessageHandler = useCallback((key: string, handler: MessageHandler) => {
        messageHandlers.set(key, handler);
    }, []);

    const navigate = useCallback(
        (path: string) => {
            wsRequest({ type: "getEntry", currentPath: path });
        },
        [wsRequest],
    );

    return (
        <websocketContext.Provider
            value={{
                root,
                status,
                entries,
                repoName,
                navigate,
                currentPath,
                addMessageHandler,
            }}
        >
            <Banner className="z-50" />
            {children}
        </websocketContext.Provider>
    );
};
