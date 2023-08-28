import { useContext, useEffect } from "react";
import {
    websocketContext,
    type MessageHandler,
} from "../../websocket-context/context";
import { Container } from "../container";
import { markdownToHtml } from "./markdown-it";
import { scrollFnMap } from "./markdown-it/scroll";

type Props = {
    className?: string;
};

const ELEMENT_ID = "markdown-content";

export const Markdown = ({ className }: Props) => {
    const filename = "README.md";
    const { addMessageHandler } = useContext(websocketContext);

    useEffect(() => {
        const messageHandler: MessageHandler = (message) => {
            const contentElement = document.getElementById(ELEMENT_ID);
            if (!contentElement) return;

            if (message.markdown && contentElement) {
                markdownToHtml(message.markdown)
                    .then((html) => (contentElement.innerHTML = html))
                    .catch((error) => {
                        throw error;
                    });
            }

            if (message.cursorMove) {
                scrollFnMap[message.cursorMove.sync_scroll_type](
                    message.cursorMove,
                );
            }
        };

        addMessageHandler("markdown", messageHandler);
    }, [addMessageHandler]);

    return (
        <Container className={className}>
            <p className="!mb-0 p-4 text-sm font-semibold">{filename}</p>
            <div id={ELEMENT_ID} className="p-11 pt-0" />
        </Container>
    );
};
