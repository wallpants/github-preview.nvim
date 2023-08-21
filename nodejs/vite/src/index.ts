import { type ServerMessage } from "../../types";
import { markdownToHtml } from "./markdown-to-html";

const ws = new WebSocket("ws://" + window.location.host);
const contentElement = document.getElementsByClassName("markdown-body")[0];

// ws.onclose = () => window.close();
ws.onmessage = async (event) => {
    const message = JSON.parse(String(event.data)) as ServerMessage;
    console.log("markdown: ", message.markdown);
    const html = await markdownToHtml(message.markdown);
    if (contentElement) contentElement.innerHTML = html;
};
