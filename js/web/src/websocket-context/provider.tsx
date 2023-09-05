import { useCallback, useEffect, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { ENV } from "../../env";
import { Banner } from "../components/banner";
import { type WsBrowserRequest, type WsServerMessage } from "../types";
import { websocketContext, type MessageHandler, type Status } from "./context";

// we check for PORT for dev env
const url =
    "ws://" + (ENV.VITE_GP_IS_DEV ? `localhost:${ENV.VITE_GP_WS_PORT}` : window.location.host);
const ws = new ReconnectingWebSocket(url, [], {
    maxReconnectionDelay: 3000,
    // start websocket in CLOSED state, call `.reconnect()` to connect
    startClosed: true,
});

const messageHandlers = new Map<string, MessageHandler>();

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<Status>("offline");

    const wsRequest = useCallback((message: WsBrowserRequest) => {
        if (ENV.VITE_GP_IS_DEV) console.log(`requesting '${message.type}':`, message);
        ws.send(JSON.stringify(message));
    }, []);

    useEffect(() => {
        ws.onopen = () => {
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
            messageHandlers.forEach((handler) => {
                handler(message);
            });
        };

        return () => {
            messageHandlers.clear();
        };
    }, [wsRequest]);

    const addMessageHandler = useCallback((key: string, handler: MessageHandler) => {
        messageHandlers.set(key, handler);
    }, []);

    useEffect(() => {
        // we connect in useEffect hook, to wait for children components
        // to have rendered and registered their onWsMessageHandlers
        if (ENV.VITE_GP_IS_DEV) console.log("connecting websocket");
        ws.reconnect();
    }, []);

    return (
        <websocketContext.Provider value={{ wsRequest, addMessageHandler, status }}>
            <Banner className="z-50" />
            {children}
        </websocketContext.Provider>
    );
};
