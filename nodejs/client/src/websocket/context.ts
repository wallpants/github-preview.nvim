import { createContext } from "react";

export const websocketContext = createContext<WebSocket | null>(null);
