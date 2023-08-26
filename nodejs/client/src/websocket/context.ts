import { createContext } from "react";
import type ReconnectingWebSocket from "reconnecting-websocket";

export type Status = "online" | "offline";

export const websocketContext = createContext<{
    ws: ReconnectingWebSocket | null;
    status: Status;
}>({ ws: null, status: "offline" });
