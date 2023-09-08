import { createBrowserHistory } from "history";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { ENV } from "../../env";
import { Banner } from "../components/banner";
import { markdownToHtml } from "../components/markdown/markdown-it";
import { getScrollOffsets, scroll } from "../components/markdown/markdown-it/scroll";
import { type WsBrowserRequest, type WsServerMessage } from "../types";
import { getFileExt, getFileName } from "../utils";
import { websocketContext, type Status } from "./context";

export const MARKDOWN_ELEMENT_ID = "markdown-element-id";

const URL =
    "ws://" + (ENV.VITE_GP_IS_DEV ? `localhost:${ENV.VITE_GP_WS_PORT}` : window.location.host);

const ws = new ReconnectingWebSocket(URL, [], {
    maxReconnectionDelay: 1500,
    // start websocket in CLOSED state, call `.reconnect()` to connect
    startClosed: true,
});

const history = createBrowserHistory();

/** Takes a string and wraps it inside a markdown
 * codeblock using file extension as language
 *
 * @example
 * ```
 * textToMarkdown({text, fileExt: "ts"});
 * ```
 */
function textToMarkdown({ text, fileExt }: { text: string; fileExt: string | undefined }) {
    return fileExt === "md" ? text : "```" + fileExt + `\n${text}`;
}

export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    const offsets = useRef<{
        markdownTopOffset: number;
        sourceLineOffsets: number[];
    } | null>(null);
    const [root, setRoot] = useState<string>();
    const [entries, setEntries] = useState<string[]>();
    const [repoName, setRepoName] = useState<string>();
    const [status, setStatus] = useState<Status>("offline");
    const [currentPath, setCurrentPath] = useState<string>();
    const [syncScrollEnabled, setSyncScrollEnabled] = useState<boolean>();

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

    // Register websocket listeners
    useEffect(() => {
        ws.onopen = () => {
            if (ENV.VITE_GP_IS_DEV) console.log("websocket connected");
            setStatus("online");
            wsRequest({ type: "init" });
        };
        ws.onclose = () => {
            setStatus("reconnecting");
        };
        ws.onmessage = (event) => {
            const message = JSON.parse(String(event.data)) as WsServerMessage;
            if (ENV.VITE_GP_IS_DEV) console.log("received:", message);

            if (message.goodbye) window.close();
            if (message.root) setRoot(message.root);
            if (message.entries) setEntries(message.entries);
            if (message.repoName) setRepoName(message.repoName);
            if (message.syncScrollEnabled) setSyncScrollEnabled(message.syncScrollEnabled);
            if (message.currentPath) {
                setCurrentPath(message.currentPath);

                // "root" must either already be in state
                // or it must be present in the current message
                const safeRoot = message.root ?? root;
                if (!safeRoot) throw Error("root missing");

                const relative = message.currentPath.slice(safeRoot.length);
                history.push("/" + relative);
            }

            const safeCurrentPath = message.currentPath ?? currentPath;
            if (!safeCurrentPath) throw Error("currentPath missing");

            const fileName = getFileName(safeCurrentPath);
            const markdownElement = document.getElementById(MARKDOWN_ELEMENT_ID);

            if (message.content === null || !fileName) {
                offsets.current = null; // if content changes, existing offsets become outdated
                if (markdownElement) markdownElement.innerHTML = "";
            }

            if (message.content) {
                offsets.current = null; // if content changes, existing offsets become outdated
                if (!markdownElement) return;
                const fileExt = getFileExt(fileName);
                const markdown = textToMarkdown({
                    text: message.content,
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

            if (message.cursorMove && syncScrollEnabled) {
                if (!offsets.current) offsets.current = getScrollOffsets();
                scroll(message.cursorMove, offsets.current);
            }
        };
    }, [wsRequest, currentPath, root, syncScrollEnabled]);

    const navigate = useCallback(
        (path: string) => {
            wsRequest({ type: "getEntry", currentPath: path });
        },
        [wsRequest],
    );

    return (
        <websocketContext.Provider
            value={{
                root,
                status,
                entries,
                repoName,
                navigate,
                currentPath,
                syncScrollEnabled,
            }}
        >
            <Banner className="z-50" />
            {children}
        </websocketContext.Provider>
    );
};
