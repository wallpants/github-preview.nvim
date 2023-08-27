import { useContext, useEffect } from "react";
import { type WsMessage } from "../../../../types";
import { websocketContext } from "../../websocket/context";
import { Container } from "../container";
import { DirIcon } from "./dir-icon";
import { FileIcon } from "./file-icon";

const iconClassName = "mr-3 h-5 w-5";

const IconMap = {
    dir: <DirIcon className={iconClassName} />,
    file: <FileIcon className={iconClassName} />,
};

const Entry = ({ type }: { type: "dir" | "file" }) => {
    return (
        <div className="group flex h-[38px] items-center border-t border-border-default px-4 first:border-t-0 hover:bg-canvas-subtle">
            {IconMap[type]}
            <span className="cursor-pointer text-sm text-fg-default hover:text-accent-fg hover:underline">
                entry
            </span>
        </div>
    );
};

export const Explorer = () => {
    const { ws } = useContext(websocketContext);

    useEffect(() => {
        if (!ws) return;

        function handleWsMessage(event: MessageEvent<unknown>) {
            const message = JSON.parse(String(event.data)) as WsMessage;
            console.log("relativeFilepath: ", message.relativeFilepath);
        }

        ws.addEventListener("message", handleWsMessage);
        return () => {
            ws.removeEventListener("message", handleWsMessage);
        };
    }, [ws]);

    return (
        <Container>
            <Entry type="dir" />
            <Entry type="dir" />
            <Entry type="dir" />
            <Entry type="dir" />
            <Entry type="dir" />
            <Entry type="file" />
            <Entry type="file" />
            <Entry type="file" />
            <Entry type="file" />
            <Entry type="file" />
        </Container>
    );
};
