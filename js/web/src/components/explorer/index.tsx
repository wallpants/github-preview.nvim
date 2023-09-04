import { createBrowserHistory } from "history";
import { useContext, useEffect, useState } from "react";
import { ENV } from "../../../env";
import { websocketContext, type MessageHandler } from "../../websocket-context/context";
import { Container } from "../container";
import { EXPLORER_ELE_ID } from "../markdown/markdown-it/scroll";
import { ThemePicker } from "../theme-select";
import { EntryComponent } from "./entry";

const history = createBrowserHistory();

export const Explorer = () => {
    const { wsRequest, addMessageHandler } = useContext(websocketContext);
    const [entries, setEntries] = useState<string[]>([]);
    const [parent, setParent] = useState<string>();
    const [root, setRoot] = useState<string>();
    const [currentPath, setCurrentPath] = useState<string>();
    const [repoName, setRepoName] = useState<string>();

    useEffect(() => {
        const messageHandler: MessageHandler = (message) => {
            const { root, repoName, entries, currentPath } = message;
            if (currentPath) setCurrentPath(currentPath);
            if (repoName) setRepoName(repoName);
            if (entries) setEntries(entries);
            if (root) setRoot(root);
        };

        if (ENV.IS_DEV) console.log("adding explorer messageHandler");
        addMessageHandler("explorer", messageHandler);
    }, [addMessageHandler, wsRequest]);

    useEffect(() => {
        if (!root || !currentPath) return;

        const relative = currentPath.slice(root.length);
        history.push("/" + relative);

        wsRequest({ type: "getEntry", currentPath });

        const segments = relative.split("/");
        if (segments.length) {
            segments.pop();
            const isDir = relative.endsWith("/");
            if (isDir) segments.pop(); // dirs include an empty string as last element after split("/")
            segments.push(""); // this adds trailing slash with join below
            const parent = root + segments.join("/");
            setParent(parent);
        }
    }, [root, currentPath, wsRequest]);

    const [username, repo] = repoName?.split("/") ?? "";

    return (
        <div id={EXPLORER_ELE_ID}>
            <Container className="border-none">
                <ThemePicker />
                <div className="flex">
                    {username && (
                        <img
                            src={`https://github.com/${username}.png?size=48`}
                            className="mb-4 mr-2 mt-6 h-6 w-6 rounded-[100%]"
                        />
                    )}
                    <h3>{repo}</h3>
                </div>
            </Container>
            <Container>
                {parent && (
                    <EntryComponent absPath={parent} setCurrentPath={setCurrentPath} isParent />
                )}
                {entries.map((entry) => (
                    <EntryComponent key={entry} absPath={entry} setCurrentPath={setCurrentPath} />
                ))}
            </Container>
        </div>
    );
};
