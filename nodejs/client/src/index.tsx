import "./github-styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { RouterProvider } from "./router-context/provider";
import { WebsocketProvider } from "./websocket-content/provider";

// const router = createBrowserRouter([{ element: <App />,  }]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <WebsocketProvider>
            <RouterProvider>
                <App />
            </RouterProvider>
        </WebsocketProvider>
    </React.StrictMode>,
);
