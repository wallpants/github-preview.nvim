import { useCallback, useEffect, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { ENV } from "../../env";
import { Banner } from "../components/banner";
import { type WsBrowserRequest, type WsServerMessage } from "../types";
import { websocketContext, type MessageHandler, type Status } from "./context";

// we check for PORT for dev env
const url = "ws://" + (ENV.VITE_GP_PORT ? `localhost:${ENV.VITE_GP_PORT}` : window.location.host);
const ws = new ReconnectingWebSocket(url, [], {
    maxReconnectionDelay: 3000,
});

const messageHandlers = new Map<string, MessageHandler>();

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<Status>("online");

    const wsRequest = useCallback((message: WsBrowserRequest) => {
        ws.send(JSON.stringify(message));
    }, []);

    useEffect(() => {
        ws.onopen = () => {
            setStatus("online");
        };
        ws.onclose = () => {
            setStatus("reconnecting");
        };
        ws.onmessage = (event) => {
            const message = JSON.parse(String(event.data)) as WsServerMessage;
            if (ENV.VITE_GP_PORT) console.log("received:", message);
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

    return (
        <websocketContext.Provider value={{ wsRequest, addMessageHandler, status }}>
            <Banner className="z-50" />
            {children}
        </websocketContext.Provider>
    );
};
