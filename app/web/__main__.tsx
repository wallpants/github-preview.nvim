/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from "react";
import ReactDOM from "react-dom/client";
import { Explorer } from "./components/explorer/index.tsx";
import { Markdown } from "./components/markdown/index.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { WebsocketProvider } from "./components/websocket-provider/provider";

// consts defined during Bun build or vite config
declare const __HOST__: string;
declare const __PORT__: number;
declare const __DEV__: boolean;

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <WebsocketProvider host={__HOST__} port={__PORT__} is_dev={__DEV__}>
            <ThemeProvider>
                <div className="flex h-screen w-screen flex-row-reverse overflow-hidden py-3">
                    <Markdown className="mx-4 h-full flex-1 overflow-y-auto overflow-x-hidden" />
                    <Explorer />
                </div>
            </ThemeProvider>
        </WebsocketProvider>
    </React.StrictMode>,
);
