import "@wooorm/starry-night/style/both.css";
import "github-markdown-css/github-markdown.css";
import { type ServerMessage } from "../../types";
import { markdownToHtml } from "./markdown-to-html";
import "./style.css";

// const url = "ws://" + window.location.host;
const url = "ws://localhost:4002";
const ws = new WebSocket(url);
const contentElement = document.getElementById("content");

// ws.onclose = () => window.close();
ws.onmessage = async (event) => {
    const message = JSON.parse(String(event.data)) as ServerMessage;
    const html = await markdownToHtml(message.markdown);
    if (contentElement) contentElement.innerHTML = html;
};
