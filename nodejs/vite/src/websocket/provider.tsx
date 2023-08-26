import { type ReactNode } from "react";
import { websocketContext } from "./context";

const url = import.meta.env.DEV
    ? "ws://localhost:4002"
    : "ws://" + window.location.host;
const ws = new WebSocket(url);

type Props = {
    children: ReactNode;
};

export const WebsocketProvider = ({ children }: Props) => {
    return (
        <websocketContext.Provider value={ws}>
            {children}
        </websocketContext.Provider>
    );
};
