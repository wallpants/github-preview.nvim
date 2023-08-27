import { useContext, useEffect, useState } from "react";
import { type Entry } from "../../../../types";
import {
    websocketContext,
    type MessageHandler,
} from "../../websocket-context/context";
import { Container } from "../container";
import { ThemePicker } from "../theme-select";
import { DirIcon } from "./dir-icon";
import { FileIcon } from "./file-icon";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
    dir: <DirIcon className={iconClassName} />,
    file: <FileIcon className={iconClassName} />,
};

const EntryComponent = ({
    type,
    name,
}: {
    type: "dir" | "file";
    name: string;
}) => {
    const { wsSend } = useContext(websocketContext);

    function requestEntries() {
        wsSend({ entry: { name, type } });
    }

    return (
        <div className="group flex h-[38px] items-center border-t border-github-border-default px-4 first:border-t-0 hover:bg-github-canvas-subtle">
            {IconMap[type]}
            <span
                onClick={requestEntries}
                className="cursor-pointer text-sm !text-github-fg-default hover:!text-github-accent-fg hover:underline"
            >
                {name}
            </span>
        </div>
    );
};

export const Explorer = () => {
    const { addMessageHandler } = useContext(websocketContext);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [entry, setEntry] = useState<Entry>();
    const [repoName, setRepoName] = useState<string>("");

    useEffect(() => {
        const messageHandler: MessageHandler = (message) => {
            if (message.repoName) setRepoName(message.repoName);
            if (message.entries) setEntries(message.entries);
            if (message.entry) setEntry(message.entry);
        };
        addMessageHandler("explorer", messageHandler);
    }, [addMessageHandler]);

    const segments = entry?.name.split("/") ?? [];
    const [username, repo] = repoName.split("/");

    return (
        <>
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
                {segments.length > 1 && <EntryComponent name=".." type="dir" />}
                {entries.map(({ name, type }) => (
                    <EntryComponent key={name} name={name} type={type} />
                ))}
            </Container>
        </>
    );
};
