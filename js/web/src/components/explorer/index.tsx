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

        const segments = relative.split("/");
        if (segments.length > 1) {
            segments.pop();
            segments.pop();
            let parent = root + segments.join("/");
            // parent is always a dir, must end with "/"
            if (!parent.endsWith("/")) parent += "/";
            setParent(parent);
        } else setParent(undefined);
        // eslint-disable-next-line
    }, [entries]);

    function navigate(path: string) {
        setCurrentPath(path);
        wsRequest({ type: "getEntry", currentPath: path });
    }

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
                {parent && <EntryComponent absPath={parent} navigate={navigate} isParent />}
                {entries.map((entry) => (
                    <EntryComponent key={entry} absPath={entry} navigate={navigate} />
                ))}
            </Container>
        </div>
    );
};
