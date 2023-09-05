import { useContext, useEffect } from "react";
import { ENV } from "../../../env";
import { getFileExt, getFileName } from "../../utils";
import { websocketContext, type MessageHandler } from "../../websocket-context/context";
import { Container } from "../container";
import { markdownToHtml } from "./markdown-it";
import { scrollFnMap } from "./markdown-it/scroll";

const ELEMENT_ID = "markdown-content";

/** Takes a string and wraps it inside a markdown
 * codeblock using file extension as language
 *
 * @example
 * ```
 * textToMarkdown({text, fileExt: "ts"});
 * ```
 */
function textToMarkdown({ text, fileExt }: { text: string; fileExt: string | undefined }) {
    return fileExt === "md" ? text : "```" + fileExt + `\n${text}`;
}

export const Markdown = ({ className }: { className?: string }) => {
    const { addMessageHandler, currentPath } = useContext(websocketContext);

    useEffect(() => {
        const messageHandler: MessageHandler = (message, fileName, syncScrollType) => {
            const contentElement = document.getElementById(ELEMENT_ID);
            if (!contentElement) return;

            const fileExt = getFileExt(fileName);

            if (message.content === null || !fileName) {
                contentElement.innerHTML = "";
            } else if (message.content) {
                const markdown = textToMarkdown({
                    text: message.content,
                    fileExt,
                });

                // className={cn("[&>div>pre]:!mb-0", fileExt === "md" && "p-11", "pt-0")}
                if (fileExt === "md") contentElement.style.setProperty("padding", "44px");

                contentElement.innerHTML = markdownToHtml(markdown);
            }

            if (message.cursorMove && syncScrollType) {
                scrollFnMap[syncScrollType](message.cursorMove, fileExt);
            }
        };

        if (ENV.VITE_GP_IS_DEV) console.log("adding markdown messageHandler");
        addMessageHandler("markdown", messageHandler);
    }, [addMessageHandler]);

    const fileName = getFileName(currentPath);

    return (
        <Container className={className}>
            <p className="!mb-0 p-4 text-sm font-semibold">{fileName}</p>
            {/* TODO(gualcasas)
             * I believe the [&>div>pre] selector y causing issues
             * with the markdown rendering
             */}
            <div id={ELEMENT_ID} className="[&>div>pre]:!mb-0 pt-0" />
        </Container>
    );
};
