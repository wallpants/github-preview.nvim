import { createBrowserHistory } from "history";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { type BrowserState } from "../../../server/src/types";
import { ENV } from "../../env";
import { Banner } from "../components/banner";
import { markdownToHtml } from "../components/markdown/markdown-it";
import { getScrollOffsets, scroll } from "../components/markdown/markdown-it/scroll";
import { type WsBrowserRequest, type WsServerMessage } from "../types";
import { getFileExt, getFileName } from "../utils";
import { websocketContext } from "./context";

export const MARKDOWN_ELEMENT_ID = "markdown-element-id";

const URL =
    "ws://" +
    (ENV.VITE_GP_IS_DEV ? `localhost:${ENV.VITE_GP_WS_PORT}` : window.location.host);

const ws = new ReconnectingWebSocket(URL, [], {
    maxReconnectionDelay: 1500,
    startClosed: true,
});

const history = createBrowserHistory();

function textToMarkdown({
    text,
    fileExt,
}: {
    text: string;
    fileExt: string | undefined;
}) {
    return fileExt === "md" ? text : "```" + fileExt + `\n${text}`;
}

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    const state = useRef<Partial<BrowserState>>({});
    const offsets = useRef<{
        markdownTopOffset: number;
        sourceLineOffsets: [number, HTMLElement][];
    } | null>(null);
    const [tick, setTick] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // we connect in useEffect hook, to wait for children components
        // to have rendered and registered their onWsMessageHandlers
        if (ENV.VITE_GP_IS_DEV) console.log("connecting websocket");
        ws.reconnect();
    }, []);

    const wsRequest = useCallback((message: WsBrowserRequest) => {
        if (ENV.VITE_GP_IS_DEV) console.log(`requesting '${message.type}'`, message);
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
            if (ENV.VITE_GP_IS_DEV) console.log("received:", message);

            const {
                goodbye,
                root,
                entries,
                repoName,
                syncScrollEnabled,
                currentPath,
                content,
                cursorMove,
            } = message;

            if (goodbye) window.close();
            if (root) state.current.root = root;
            if (entries) state.current.entries = entries;
            if (repoName) state.current.repoName = repoName;
            if (syncScrollEnabled) state.current.syncScrollEnabled = syncScrollEnabled;

            if (currentPath) {
                if (state.current.currentPath !== currentPath) {
                    state.current.currentPath = currentPath;
                    setTick((tick) => !tick);
                }

                if (!state.current.root) throw Error("root missing");
                const relative = currentPath.slice(state.current.root.length);
                history.push("/" + relative);
            }

            const markdownElement = document.getElementById(MARKDOWN_ELEMENT_ID);
            if (!markdownElement) throw Error("markdownElement missing");

            const fileName = getFileName(state.current.currentPath);
            if (content === null || !fileName) {
                offsets.current = null; // if content changes, existing offsets become outdated
                markdownElement.innerHTML = "";
            }

            if (content) {
                offsets.current = null; // if content changes, existing offsets become outdated
                const fileExt = getFileExt(fileName);
                const markdown = textToMarkdown({
                    text: content,
                    fileExt,
                });

                if (fileExt === "md") {
                    markdownElement.style.setProperty("padding", "44px");
                } else {
                    markdownElement.style.setProperty("padding", "0px");
                    // remove margin-bottom added by github-styles if rendering only code
                    // markdownElement.style.setProperty("margin-bottom", "-16px");
                }

                markdownElement.innerHTML = markdownToHtml(markdown);
            }

            if (cursorMove && state.current.syncScrollEnabled) {
                if (!offsets.current) offsets.current = getScrollOffsets();
                scroll(cursorMove, offsets.current);
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
                tick,
            }}
        >
            <Banner className="z-50" />
            {children}
        </websocketContext.Provider>
    );
};
