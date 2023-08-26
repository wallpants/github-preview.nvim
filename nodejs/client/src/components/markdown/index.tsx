import { useContext, useEffect } from "react";
import { type WsMessage } from "../../../../types";
import { websocketContext } from "../../websocket/context";
import { Container } from "../container";
import { markdownToHtml } from "./markdown-it";
import { scrollFnMap } from "./markdown-it/scroll";

type Props = {
    className?: string;
};

const ELEMENT_ID = "markdown-content";

export const Markdown = ({ className }: Props) => {
    const filename = "README.md";
    const { ws, status } = useContext(websocketContext);

    useEffect(() => {
        if (!ws) return;
        const contentElement = document.getElementById(ELEMENT_ID);
        ws.onmessage = async (event) => {
            const message = JSON.parse(String(event.data)) as WsMessage;

            if (message.markdown) {
                const html = await markdownToHtml(message.markdown);
                if (contentElement) contentElement.innerHTML = html;
            }

            if (message.cursorMove) {
                scrollFnMap[message.cursorMove.sync_scroll_type](
                    message.cursorMove,
                );
            }

            if (message.goodbye) {
                window.close();
            }
        };
    }, [ws]);

    return (
        <Container className={className}>
            <p className="!mb-0 p-4 text-sm font-semibold">Status: {status}</p>
            <p className="!mb-0 p-4 text-sm font-semibold">{filename}</p>
            <div id={ELEMENT_ID} className="p-11 pt-0" />
        </Container>
    );
};
