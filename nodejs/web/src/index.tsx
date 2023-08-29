import "./github-styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { RouterProvider } from "./router-context/provider";
import { WebsocketProvider } from "./websocket-context/provider";

const root = document.getElementById("root");

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <WebsocketProvider>
                <RouterProvider>
                    <App />
                </RouterProvider>
            </WebsocketProvider>
        </React.StrictMode>,
    );
}
