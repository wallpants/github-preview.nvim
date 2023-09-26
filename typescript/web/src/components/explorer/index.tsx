import { useContext, useEffect, useState } from "react";
import { websocketContext } from "../../websocket-context/context.ts";
import { Container } from "../container.tsx";
import { ThemePicker } from "../theme-select.tsx";

const root = "";

export const Explorer = ({ className }: { className: string }) => {
    const { isConnected, registerHandler, getEntries } = useContext(websocketContext);
    const [entries, setEntries] = useState<string[]>([]);

    useEffect(() => {
        registerHandler("explorer-root", (message) => {
            if (message.currentPath === root && message.entries) {
                setEntries(message.entries);
            }
        });
    }, [registerHandler, getEntries]);

    useEffect(() => {
        if (!isConnected) return;
        getEntries(root);
    }, [isConnected, getEntries]);

    console.log("entries: ", entries);

    return (
        <Container className={className}>
            <ThemePicker />
            <h4 className="!my-5 px-6">Files</h4>
        </Container>
    );
};
