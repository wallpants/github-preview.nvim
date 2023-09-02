import { createBrowserHistory } from "history";
import { useContext, useEffect, type ReactNode } from "react";
import { websocketContext, type MessageHandler } from "../websocket-context/context";
import { routerContext } from "./context";

const history = createBrowserHistory();

interface Props {
    children: ReactNode;
}

export const RouterProvider = ({ children }: Props) => {
    const { addMessageHandler } = useContext(websocketContext);

    useEffect(() => {
        const messageHandler: MessageHandler = (message) => {
            if (message.currentEntry) {
                const relative = message.currentEntry.absPath.replace(message.root, "");
                history.push(relative);
            }
        };
        addMessageHandler("ws-router", messageHandler);
    }, [addMessageHandler]);

    return <routerContext.Provider value={history}>{children}</routerContext.Provider>;
};
