import "./github-styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";
import { WebsocketProvider } from "./websocket/provider";

const router = createBrowserRouter([
    {
        path: "*",
        element: <App />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <WebsocketProvider>
            <RouterProvider router={router} />
        </WebsocketProvider>
    </React.StrictMode>,
);
