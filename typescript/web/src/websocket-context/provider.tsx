import { type BrowserState, type WsBrowserRequest, type WsServerMessage } from "@gp/shared";
import { createBrowserHistory } from "history";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { contentToHtml } from "../components/markdown/markdown-it/index.ts";
import { ENV } from "../env.ts";
import { getFileExt } from "../utils.ts";
import { websocketContext } from "./context.ts";
import { getScrollOffsets, scroll, type Offsets } from "./scroll.ts";

export const MARKDOWN_ELEMENT_ID = "markdown-element-id";
export const CURSOR_LINE_ELEMENT_ID = "cursor-line-element-id";

const URL = "ws://" + (ENV.IS_DEV ? `localhost:${ENV.VITE_GP_WS_PORT}` : window.location.host);
const ws = new ReconnectingWebSocket(URL, [], {
    maxReconnectionDelay: 1500,
    startClosed: true,
});

const history = createBrowserHistory();

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    const offsets = useRef<Offsets | null>(null);
    const state = useRef<Partial<BrowserState>>({});
    const markdownElement = useRef<HTMLElement | null>(null);
    const cursorLineElement = useRef<HTMLElement | null>(null);
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
        // recalculate offsets whenever markdownElement's height changes
        if (!state.current.content?.length || !markdownElement.current) return;

        const observer = new ResizeObserver(() => {
            offsets.current = getScrollOffsets();
            if (typeof state.current.cursorLine === "number") {
                scroll(
                    state.current.topOffsetPct,
                    offsets.current,
                    state.current.cursorLine,
                    markdownElement.current!,
                    cursorLineElement.current!,
                );
            }
        });
        observer.observe(markdownElement.current);

        return () => {
            observer.disconnect();
        };
    }, [currentPath, markdownElement]);

    useEffect(() => {
        // Update url on navigation
        if (!currentPath) return;
        if (!state.current.root) throw Error("root missing");
        const relative = currentPath.slice(state.current.root.length);
        history.push("/" + relative);
    }, [currentPath]);

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
            const { goodbye, ...stateUpdate } = JSON.parse(String(event.data)) as WsServerMessage;
            if (ENV.IS_DEV) console.log("received:", stateUpdate);
            Object.assign(state.current, stateUpdate);

            if (goodbye) window.close();

            // Set currentPath in react state to trigger render
            // if path is the same as currentState, react doesn't rerender
            setCurrentPath(state.current.currentPath);

            if (!markdownElement.current || !cursorLineElement.current) {
                markdownElement.current = document.getElementById(MARKDOWN_ELEMENT_ID);
                if (!markdownElement.current) throw Error("MarkdownElement not found");
                cursorLineElement.current = document.getElementById(CURSOR_LINE_ELEMENT_ID);
                if (!cursorLineElement.current) throw Error("CursorLineElement not found");
            }

            const fileExt = getFileExt(state.current.currentPath);

            if (stateUpdate.content) {
                markdownElement.current.innerHTML = contentToHtml({
                    content: stateUpdate.content,
                    fileExt,
                });

                if (fileExt === "md") {
                    markdownElement.current.style.setProperty("padding", "44px");
                    cursorLineElement.current.classList.add("h-11");
                    cursorLineElement.current.classList.remove("-translate-y-3", "h-9");
                } else {
                    markdownElement.current.style.setProperty("padding", "0px");
                    markdownElement.current.style.setProperty("margin-bottom", "-16px");
                    cursorLineElement.current.classList.add("-translate-y-3", "h-9");
                    cursorLineElement.current.classList.remove("h-11");
                }
            }

            if (stateUpdate.cursorLineColor) {
                cursorLineElement.current.style.setProperty(
                    "background-color",
                    stateUpdate.cursorLineColor,
                );
            }

            if (typeof state.current.cursorLine !== "number") {
                cursorLineElement.current.style.setProperty("visibility", "hidden");
            } else if (offsets.current) {
                scroll(
                    state.current.topOffsetPct,
                    offsets.current,
                    state.current.cursorLine,
                    markdownElement.current,
                    cursorLineElement.current,
                );
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
        <websocketContext.Provider value={{ navigate, isConnected, state, offsets, currentPath }}>
            {children}
        </websocketContext.Provider>
    );
};
