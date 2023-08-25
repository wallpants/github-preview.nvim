import "@wooorm/starry-night/style/both.css";
import "github-markdown-css/github-markdown.css";
import { type WsMessage } from "../../types";
import { markdownToHtml } from "./markdown-it";
import { scrollFnMap } from "./markdown-it/scroll";
import "./style.css";

const url = import.meta.env.DEV
    ? "ws://localhost:4002"
    : "ws://" + window.location.host;
const ws = new WebSocket(url);
const contentElement = document.getElementById("content");

ws.onmessage = async (event) => {
    const message = JSON.parse(String(event.data)) as WsMessage;

    if (message.markdown) {
        const html = await markdownToHtml(message.markdown);
        if (contentElement) contentElement.innerHTML = html;
    }

    if (message.cursorMove) {
        scrollFnMap[message.cursorMove.sync_scroll_type](message.cursorMove);
    }

    if (message.goodbye) {
        window.close();
    }
};
