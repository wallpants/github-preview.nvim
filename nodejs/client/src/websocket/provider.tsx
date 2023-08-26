import { useEffect, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { PORT } from "../../env";
import { websocketContext, type Status } from "./context";

// we check for PORT for dev env
const url = "ws://" + (PORT ? `localhost:${PORT}` : window.location.host);
const ws = new ReconnectingWebSocket(url);

type Props = {
    children: ReactNode;
};

export const WebsocketProvider = ({ children }: Props) => {
    const [status, setStatus] = useState<Status>("offline");

    useEffect(() => {
        ws.onopen = () => setStatus("online");
        ws.onclose = () => setStatus("offline");
    }, []);

    return (
        <websocketContext.Provider value={{ ws, status }}>
            {children}
        </websocketContext.Provider>
    );
};
