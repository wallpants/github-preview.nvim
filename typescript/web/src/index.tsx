/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from "react";
import ReactDOM from "react-dom/client";
import { Explorer } from "./components/explorer/index.tsx";
import { Markdown } from "./components/markdown/index.tsx";
import "./index.scss";
import { WebsocketProvider } from "./websocket-context/provider.tsx";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <WebsocketProvider>
            <div className="flex h-screen w-screen overflow-hidden py-3">
                <Explorer />
                <Markdown className="mx-4 h-full flex-1 overflow-y-auto overflow-x-hidden" />
            </div>
        </WebsocketProvider>
    </React.StrictMode>,
);
