/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from "react";
import ReactDOM from "react-dom/client";
import { Explorer } from "./components/explorer/index.tsx";
import { Markdown } from "./components/markdown/index.tsx";
import "./index.scss";
import { WebsocketProvider } from "./websocket-context/provider.tsx";

const root = document.getElementById("root");

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <WebsocketProvider>
                <div className="flex overflow-hidden h-screen w-screen pt-5">
                    <Explorer className="hidden md:block w-80 sticky shrink-0 top-0 h-full pt-5 overflow-y-auto" />
                    <Markdown className="max-w-[1000px] mx-auto h-full w-full overflow-y-auto" />
                </div>
            </WebsocketProvider>
        </React.StrictMode>,
    );
}
