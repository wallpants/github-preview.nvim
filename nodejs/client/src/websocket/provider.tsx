import { type ReactNode } from "react";
import { PORT } from "../../env";
import { websocketContext } from "./context";

// we check for PORT for dev env
const url = "ws://" + (PORT ? `localhost:${PORT}` : window.location.host);
console.log("PORT: ", PORT);

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
