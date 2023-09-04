import { useContext, useEffect, useState } from "react";
import { websocketContext, type MessageHandler } from "../../websocket-context/context";
import { Container } from "../container";
import { EXPLORER_ELE_ID } from "../markdown/markdown-it/scroll";
import { ThemePicker } from "../theme-select";
import { EntryComponent } from "./entry";

export const Explorer = () => {
    const { addMessageHandler } = useContext(websocketContext);
    const [entries, setEntries] = useState<string[]>([]);
    const [parent, setParent] = useState<string>();
    const [repoName, setRepoName] = useState<string>();

    useEffect(() => {
        const messageHandler: MessageHandler = (message) => {
            const { root, repoName, entries, currentEntry } = message;

            if (repoName) setRepoName(repoName);
            if (entries) setEntries(entries);
            if (currentEntry) {
                const isDir = currentEntry.absPath.endsWith("/");
                const relative = currentEntry.absPath.slice(root.length);
                const segments = relative.split("/");
                if (segments.length) {
                    if (isDir) {
                        // dirs include an empty string as last element after split("/")
                        segments.pop();
                    }
                    segments.pop();
                    segments.push(""); // this adds trailing slash with join below
                    const parent = root + segments.join("/");
                    setParent(parent);
                }
            }
        };
        addMessageHandler("explorer", messageHandler);
    }, [addMessageHandler]);

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
                {parent && <EntryComponent absPath={parent} isParent />}
                {entries.map((entry) => (
                    <EntryComponent key={entry} absPath={entry} />
                ))}
            </Container>
        </div>
    );
};
