import { useContext, useEffect, useState } from "react";
import { type WsMessage } from "../../../../types";
import { websocketContext, type MessageHandler } from "../../websocket/context";
import { Container } from "../container";
import { DirIcon } from "./dir-icon";
import { FileIcon } from "./file-icon";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
    dir: <DirIcon className={iconClassName} />,
    file: <FileIcon className={iconClassName} />,
};

const Entry = ({ type, name }: { type: "dir" | "file"; name: string }) => {
    return (
        <div className="group flex h-[38px] items-center border-t border-border-default px-4 first:border-t-0 hover:bg-canvas-subtle">
            {IconMap[type]}
            <span className="cursor-pointer text-sm text-fg-default hover:text-accent-fg hover:underline">
                {name}
            </span>
        </div>
    );
};

export const Explorer = () => {
    const { addMessageHandler } = useContext(websocketContext);
    const [entries, setEntries] = useState<NonNullable<WsMessage["entries"]>>(
        [],
    );
    const [relativePath, setRelativePath] = useState<string>("");

    useEffect(() => {
        const messageHandler: MessageHandler = (message) => {
            if (message.entries) setEntries(message.entries);
            if (message.relativeFilepath) {
                setRelativePath(message.relativeFilepath);
            }
        };
        addMessageHandler("explorer", messageHandler);
    }, [addMessageHandler]);

    const segments = relativePath.split("/");

    return (
        <Container>
            {segments.length > 1 && <Entry name=".." type="dir" />}
            {entries.map(({ name, type }) => (
                <Entry key={name} name={name} type={type} />
            ))}
        </Container>
    );
};
