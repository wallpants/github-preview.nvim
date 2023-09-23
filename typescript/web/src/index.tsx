/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from "react";
import ReactDOM from "react-dom/client";
import { Explorer } from "./components/explorer/index.tsx";
import { Header } from "./components/header.tsx";
import { Markdown } from "./components/markdown/index.tsx";
import "./index.scss";
import { WebsocketProvider } from "./websocket-context/provider.tsx";

const root = document.getElementById("root");

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <WebsocketProvider>
                <Header />
                <div className={"relative h-full w-full p-8 pb-0 flex"}>
                    <Explorer />
                    <Markdown className="shrink-0 flex-1" />
                </div>
            </WebsocketProvider>
        </React.StrictMode>,
    );
}
