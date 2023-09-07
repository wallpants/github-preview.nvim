import React from "react";
import ReactDOM from "react-dom/client";
import { Markdown } from "./components/markdown";
import "./index.scss";
import { WebsocketProvider } from "./websocket-context/provider";

const root = document.getElementById("root");

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <WebsocketProvider>
                <div className={"relative h-full w-full p-8"}>
                    {/* <Explorer /> */}
                    <Markdown />
                </div>
            </WebsocketProvider>
        </React.StrictMode>,
    );
}
