/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React from "react";
import { Explorer } from "./explorer/index.tsx";
import { Markdown } from "./markdown/index.tsx";
import { Provider } from "./provider/provider.tsx";

export const GP_STATIC_PREFIX = "/__static_github_preview_";
export const PANTSDOWN_CSS = "pantsdown.css";

export const Index = ({
    host,
    port,
    is_dev,
}: {
    host?: string;
    port?: number;
    is_dev?: boolean;
}) => (
    <React.StrictMode>
        <html lang="en" className="pantsdown dark">
            <head>
                <meta charSet="UTF-8" />
                <link rel="icon" type="image/svg+xml" href={`${GP_STATIC_PREFIX}github.svg`} />
                <link href={`${GP_STATIC_PREFIX}tailwind.css`} rel="stylesheet" />
                <link href={`${GP_STATIC_PREFIX}${PANTSDOWN_CSS}`} rel="stylesheet" />
                <link href={`${GP_STATIC_PREFIX}index.css`} rel="stylesheet" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>GitHub</title>
            </head>
            <body>
                <Provider host={host} port={port} is_dev={is_dev}>
                    <div className="flex h-screen w-screen overflow-hidden py-3">
                        <Explorer />
                        <Markdown className="mx-4 h-full flex-1 overflow-y-auto overflow-x-hidden" />
                    </div>
                </Provider>
            </body>
        </html>
    </React.StrictMode>
);
