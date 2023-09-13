/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from "react";
import ReactDOM from "react-dom/client";
import { Markdown } from "./components/markdown/index.tsx";
import "./index.scss";
import { WebsocketProvider } from "./websocket-context/provider.tsx";

const root = document.getElementById("root");

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <WebsocketProvider>
                <div className={"relative h-full w-full p-8 pb-0"}>
                    {/* <Explorer /> */}
                    <Markdown />
                </div>
            </WebsocketProvider>
        </React.StrictMode>,
    );
}
