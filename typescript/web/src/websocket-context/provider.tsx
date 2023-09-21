import { type BrowserState, type WsBrowserRequest, type WsServerMessage } from "@gp/shared";
import { createBrowserHistory } from "history";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { Banner } from "../components/banner.tsx";
import { contentToHtml } from "../components/markdown/markdown-it/index.ts";
import {
    CURSOR_LINE_ELEMENT_ID,
    getScrollOffsets,
    scroll,
    type Offsets,
} from "../components/markdown/markdown-it/scroll.ts";
import { ENV } from "../env.ts";
import { getFileExt, getFileName } from "../utils.ts";
import { websocketContext } from "./context.ts";

export const MARKDOWN_ELEMENT_ID = "markdown-element-id";

const URL = "ws://" + (ENV.IS_DEV ? `localhost:${ENV.VITE_GP_WS_PORT}` : window.location.host);

const ws = new ReconnectingWebSocket(URL, [], {
    maxReconnectionDelay: 1500,
    startClosed: true,
});

const history = createBrowserHistory();

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    const state = useRef<Partial<BrowserState>>({});
    const offsets = useRef<Offsets | null>(null);
    const [currentPath, setCurrentPath] = useState<string>();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // we connect in useEffect hook, to wait for children components
        // to have rendered and registered their onWsMessageHandlers
        if (ENV.IS_DEV) console.log("connecting websocket");
        ws.reconnect();
    }, []);

    const wsRequest = useCallback((message: WsBrowserRequest) => {
        if (ENV.IS_DEV) console.log(`requesting '${message.type}'`, message);
        ws.send(JSON.stringify(message));
    }, []);

    useEffect(() => {
        // Register websocket listeners
        ws.onopen = () => {
            setIsConnected(true);
            wsRequest({ type: "init" });
        };
        ws.onclose = () => {
            setIsConnected(false);
        };
        ws.onmessage = (event) => {
            const message = JSON.parse(String(event.data)) as WsServerMessage;
            if (ENV.IS_DEV) console.log("received:", message);

            if (message.goodbye) window.close();
            if (message.root) state.current.root = message.root;
            if (message.entries) state.current.entries = message.entries;
            if (message.repoName) state.current.repoName = message.repoName;

            if (message.currentPath) {
                if (state.current.currentPath !== message.currentPath) {
                    state.current.currentPath = message.currentPath;
                    setCurrentPath(message.currentPath);
                }

                if (!state.current.root) throw Error("root missing");
                const relative = message.currentPath.slice(state.current.root.length);
                history.push("/" + relative);
            }

            const markdownElement = document.getElementById(MARKDOWN_ELEMENT_ID);
            if (!markdownElement) throw Error("markdownElement missing");

            const fileName = getFileName(state.current.currentPath);
            const fileExt = getFileExt(fileName);

            if (message.content) {
                offsets.current = null;
                state.current.content = message.content;
                markdownElement.innerHTML = contentToHtml({
                    content: state.current.content,
                    fileExt,
                });

                if (fileExt === "md") {
                    markdownElement.style.setProperty("padding", "44px");
                } else {
                    markdownElement.style.setProperty("padding", "0px");
                    markdownElement.style.setProperty("margin-bottom", "-16px");
                }
            }

            if (message.scroll !== undefined) {
                state.current.scroll = message.scroll;
            }

            if (state.current.scroll !== undefined) {
                const scrollIndicatorEle = document.getElementById(CURSOR_LINE_ELEMENT_ID);
                if (!scrollIndicatorEle) return;

                if (state.current.scroll.cursorLine === null) {
                    scrollIndicatorEle.style.setProperty("visibility", "hidden");
                    return;
                }

                scrollIndicatorEle.style.setProperty("visibility", "visible");
                if (!offsets.current) offsets.current = getScrollOffsets();
                scroll({
                    cursorLine: state.current.scroll.cursorLine,
                    winLine: state.current.scroll.winLine,
                    offsets: offsets.current,
                    fileExt,
                });
            }
        };
    }, [wsRequest]);

    const navigate = useCallback(
        (path: string) => {
            wsRequest({ type: "getEntry", currentPath: path });
        },
        [wsRequest],
    );

    return (
        <websocketContext.Provider
            value={{
                navigate,
                isConnected,
                state,
                offsets,
                currentPath,
            }}
        >
            <Banner className="z-50" />
            {children}
        </websocketContext.Provider>
    );
};
