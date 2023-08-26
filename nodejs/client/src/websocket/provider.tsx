import { type ReactNode } from "react";
import { websocketContext } from "./context";

const url =
    "ws://" + import.meta.env.DEV
        ? import.meta.env.SERVER_HOST
        : window.location.host;
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
