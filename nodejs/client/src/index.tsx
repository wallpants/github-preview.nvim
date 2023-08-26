import "./github-styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";
import { WebsocketProvider } from "./websocket/provider";

const Nothing = () => (
    <div>
        <p>Nothing</p>
    </div>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/nothing",
        element: <Nothing />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <WebsocketProvider>
            <RouterProvider router={router} />
        </WebsocketProvider>
    </React.StrictMode>,
);
