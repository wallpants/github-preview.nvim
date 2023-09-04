import { useContext, useEffect, useState } from "react";
import { ENV } from "../../../env";
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
    return fileExt === "md" ? text : "```" + fileExt + `\n${text}`;
}

export const Markdown = ({ className }: { className?: string }) => {
    const [fileName, setFileName] = useState<string>();
    const [fileExt, setFileExt] = useState<string>();
    const [hasContent, setHasContent] = useState(false);
    const { addMessageHandler } = useContext(websocketContext);

    useEffect(() => {
        const messageHandler: MessageHandler = (message) => {
            const contentElement = document.getElementById(ELEMENT_ID);
            if (!contentElement) return;

            const fileName = message.currentPath?.split("/").pop();
            const fileExt = fileName?.split(".").pop();
            setFileName(fileName);
            setFileExt(fileExt);
            setHasContent(Boolean(message.content));

            if (message.content === null) contentElement.innerHTML = "";
            if (message.content) {
                const markdown = textToMarkdown({
                    text: message.content,
                    fileExt: fileName?.split(".").pop() ?? "",
                });
                contentElement.innerHTML = markdownToHtml(markdown);
            }

            if (message.cursorMove) {
                scrollFnMap[options.scroll](message.cursorMove);
            }
        };

        if (ENV.IS_DEV) console.log("adding markdown messageHandler");
        addMessageHandler("markdown", messageHandler);
    }, [addMessageHandler]);

    return (
        <Container className={cn(!hasContent && "hidden", className)}>
            <p className="!mb-0 p-4 text-sm font-semibold">{fileName}</p>
            <div
                id={ELEMENT_ID}
                className={cn("[&>div>pre]:!mb-0", fileExt === "md" && "p-11", "pt-0")}
            />
        </Container>
    );
};
