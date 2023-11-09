/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from "react";
import ReactDOM from "react-dom/client";
import { parse } from "valibot";
import { BuildConstsSchema } from "../types.ts";
import { Explorer } from "./components/explorer/index.tsx";
import { Markdown } from "./components/markdown/index.tsx";
import { WebsocketProvider } from "./components/websocket-provider/provider";

// consts defined during Bun build or vite config
declare const __HOST__: string | undefined;
declare const __PORT__: string | undefined;
declare const __IS_DEV__: string | undefined;
declare const __THEME__: string | undefined;

const BUILD_CONSTS = parse(BuildConstsSchema, {
    HOST: __HOST__,
    PORT: __PORT__,
    IS_DEV: __IS_DEV__,
    THEME: __THEME__,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <WebsocketProvider BUILD_CONSTS={BUILD_CONSTS}>
            <div className="flex h-screen min-h-[550px] w-screen flex-row-reverse overflow-hidden py-3">
                <Markdown className="mx-4 h-full flex-1 overflow-y-auto overflow-x-hidden" />
                <Explorer />
            </div>
        </WebsocketProvider>
    </React.StrictMode>,
);
