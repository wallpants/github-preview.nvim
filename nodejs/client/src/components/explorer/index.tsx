import { useContext, useEffect, useState } from "react";
import { type CurrentEntry, type Entry } from "../../../../types";
import {
    websocketContext,
    type MessageHandler,
} from "../../websocket-context/context";
import { Container } from "../container";
import { EXPLORER_ELE_ID } from "../markdown/markdown-it/scroll";
import { ThemePicker } from "../theme-select";
import { EntryComponent } from "./entry";

export const Explorer = () => {
    const { addMessageHandler } = useContext(websocketContext);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [currentEntry, setCurrentEntry] = useState<CurrentEntry>();
    const [repoName, setRepoName] = useState<string>("");

    useEffect(() => {
        const messageHandler: MessageHandler = (message) => {
            if (message.repoName) setRepoName(message.repoName);
            if (message.entries) setEntries(message.entries);
            if (message.currentEntry) setCurrentEntry(message.currentEntry);
        };
        addMessageHandler("explorer", messageHandler);
    }, [addMessageHandler]);

    const segments = currentEntry?.relativeToRoot.split("/") ?? [];
    const [username, repo] = repoName.split("/");

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
                {segments}
            </Container>
            <Container>
                {(segments.length > 1 || currentEntry?.type === "dir") && (
                    <EntryComponent
                        relativeToRoot={currentEntry?.relativeToRoot + "/.."}
                        type="dir"
                    />
                )}
                {entries.map(({ relativeToRoot, type }) => (
                    <EntryComponent
                        key={relativeToRoot}
                        relativeToRoot={relativeToRoot}
                        type={type}
                    />
                ))}
            </Container>
        </div>
    );
};
