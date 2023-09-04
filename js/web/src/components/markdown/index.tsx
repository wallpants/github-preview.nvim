import { useContext, useEffect, useState } from "react";
import { cn } from "../../styles";
import { websocketContext, type MessageHandler } from "../../websocket-context/context";
import { Container } from "../container";
import { markdownToHtml } from "./markdown-it";
import { scrollFnMap } from "./markdown-it/scroll";

const ELEMENT_ID = "markdown-content";

// TODO(gualcasas): get these from server
const options = {
    scroll: "middle",
} as const;

/** Takes a string and wraps it inside a markdown
 * codeblock using file extension as language
 *
 * @example
 * ```
 * textToMarkdown({text, fileExt: "ts"});
 * ```
 */
function textToMarkdown({ text, fileExt }: { text: string; fileExt: string }) {
    return fileExt === ".md" ? text : "```" + fileExt + `\n${text}`;
}

type Props = {
    className?: string;
};

export const Markdown = ({ className }: Props) => {
    const [fileName, setFileName] = useState<string>();
    const [fileExt, setFileExt] = useState<string>();
    const { addMessageHandler } = useContext(websocketContext);

    useEffect(() => {
        const messageHandler: MessageHandler = (message) => {
            const contentElement = document.getElementById(ELEMENT_ID);
            if (!contentElement) return;

            if (message.currentEntry?.content) {
                setFileExt(message.currentEntry.content.fileExt);
                const filename = message.currentEntry.absPath.split("/").pop();
                setFileName(filename);
                contentElement.innerHTML = markdownToHtml(message.currentEntry.content.markdown);
            }

            if (message.cursorMove) {
                scrollFnMap[options.scroll](message.cursorMove);
            }
        };

        addMessageHandler("markdown", messageHandler);
    }, [addMessageHandler]);

    return (
        <Container className={className}>
            <p className="!mb-0 p-4 text-sm font-semibold">{fileName}</p>
            <div
                id={ELEMENT_ID}
                className={cn("[&>div>pre]:!mb-0", fileExt === ".md" && "p-11", "pt-0")}
            />
        </Container>
    );
};
