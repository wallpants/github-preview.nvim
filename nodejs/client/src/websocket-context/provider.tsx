import { useCallback, useEffect, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { type WsClientMessage, type WsServerMessage } from "../../../types";
import { PORT } from "../../env";
import { Banner } from "../components/banner";
import { websocketContext, type MessageHandler, type Status } from "./context";

// we check for PORT for dev env
const url = "ws://" + (PORT ? `localhost:${PORT}` : window.location.host);
const ws = new ReconnectingWebSocket(url, [], {
    maxReconnectionDelay: 3000,
});

type Props = {
    children: ReactNode;
};

const messageHandlers = new Map<string, MessageHandler>();

export const WebsocketProvider = ({ children }: Props) => {
    const [status, setStatus] = useState<Status>("online");

    useEffect(() => {
        ws.onopen = () => {
            setStatus("online");
        };
        ws.onclose = () => setStatus("reconnecting");
        ws.onmessage = (event) => {
            const message = JSON.parse(String(event.data)) as WsServerMessage;
            console.log("message: ", message);
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

    const wsSend = useCallback((message: WsClientMessage) => {
        ws.send(JSON.stringify(message));
    }, []);

    return (
        <websocketContext.Provider
            value={{ wsSend, addMessageHandler, status }}
        >
            <Banner className="z-50" />
            {children}
        </websocketContext.Provider>
    );
};
