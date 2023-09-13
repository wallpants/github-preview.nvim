import { type BrowserState, type WsBrowserRequest, type WsServerMessage } from "@gp/shared";
import { createBrowserHistory } from "history";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { Banner } from "../components/banner.tsx";
import { markdownToHtml } from "../components/markdown/markdown-it/index.ts";
import {
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

function textToMarkdown({ text, fileExt }: { text: string; fileExt: string | undefined }) {
    return fileExt === "md" ? text : "```" + fileExt + `\n${text}`;
}

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

            const {
                goodbye,
                root,
                entries,
                repoName,
                disableSyncScroll,
                currentPath,
                content,
                cursorLine,
            } = message;

            if (goodbye) window.close();
            if (root) state.current.root = root;
            if (entries) state.current.entries = entries;
            if (repoName) state.current.repoName = repoName;
            if (disableSyncScroll) state.current.disableSyncScroll = disableSyncScroll;

            if (currentPath) {
                if (state.current.currentPath !== currentPath) {
                    state.current.currentPath = currentPath;
                    setCurrentPath(currentPath);
                }

                if (!state.current.root) throw Error("root missing");
                const relative = currentPath.slice(state.current.root.length);
                history.push("/" + relative);
            }

            const markdownElement = document.getElementById(MARKDOWN_ELEMENT_ID);
            if (!markdownElement) throw Error("markdownElement missing");

            if (content === null) {
                offsets.current = null; // if content changes, existing offsets become outdated
                state.current.content = null;
                markdownElement.innerHTML = "";
            }

            const fileName = getFileName(state.current.currentPath);
            const fileExt = getFileExt(fileName);
            if (content) {
                offsets.current = null; // if content changes, existing offsets become outdated
                state.current.content = content;
                const markdown = textToMarkdown({
                    text: content,
                    fileExt,
                });

                if (fileExt === "md") {
                    markdownElement.style.setProperty("padding", "44px");
                } else {
                    markdownElement.style.setProperty("padding", "0px");
                    // remove margin-bottom added by github-styles if rendering only code
                    markdownElement.style.setProperty("margin-bottom", "-16px");
                }

                markdownElement.innerHTML = markdownToHtml(markdown);
            }

            if (
                cursorLine !== undefined &&
                !state.current.disableSyncScroll &&
                state.current.content
            ) {
                if (!offsets.current) offsets.current = getScrollOffsets();
                scroll({ cursorLine, offsets: offsets.current, fileExt });
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
