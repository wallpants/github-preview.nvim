import "./github-styles.scss";

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { WebsocketProvider } from "./websocket-context/provider";

const root = document.getElementById("root");

if (root) {
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <WebsocketProvider>
                <App />
            </WebsocketProvider>
        </React.StrictMode>,
    );
}
