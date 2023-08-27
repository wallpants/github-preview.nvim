import { useCallback, useEffect, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { type WsMessage } from "../../../types";
import { PORT } from "../../env";
import { websocketContext, type MessageHandler, type Status } from "./context";

// we check for PORT for dev env
const url = "ws://" + (PORT ? `localhost:${PORT}` : window.location.host);
const ws = new ReconnectingWebSocket(url);

type Props = {
    children: ReactNode;
};

const messageHandlers = new Map<string, MessageHandler>();

export const WebsocketProvider = ({ children }: Props) => {
    const [status, setStatus] = useState<Status>("offline");

    useEffect(() => {
        ws.onopen = () => setStatus("online");
        ws.onclose = () => setStatus("offline");
        ws.onmessage = (event) => {
            const message = JSON.parse(String(event.data)) as WsMessage;
            if (message.goodbye) window.close();
            messageHandlers.forEach((handler) => handler(message));
        };

        return () => {
            messageHandlers.clear();
        };
    }, []);

    const addMessageHandler = useCallback(
        (key: string, handler: MessageHandler) => {
            messageHandlers.set(key, handler);
        },
        [],
    );

    return (
        <websocketContext.Provider value={{ addMessageHandler, status }}>
            {children}
        </websocketContext.Provider>
    );
};
