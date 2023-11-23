import "./static/dev-tailwind.css";

import { parse } from "valibot";
import { BuildConstsSchema } from "../types.ts";
import { Explorer } from "./components/explorer/index.tsx";
import { Markdown } from "./components/markdown/index.tsx";
import { WebsocketProvider } from "./components/websocket-provider/provider.tsx";

// consts defined during Bun build or Vite config
declare const __HOST__: unknown;
declare const __PORT__: unknown;
declare const __IS_DEV__: unknown;
declare const __THEME__: unknown;

const BUILD_CONSTS = parse(BuildConstsSchema, {
    HOST: __HOST__,
    PORT: __PORT__,
    IS_DEV: __IS_DEV__,
    THEME: __THEME__,
});

export const App = () => (
    <WebsocketProvider BUILD_CONSTS={BUILD_CONSTS}>
        <div className="flex h-screen min-h-[300px] w-screen flex-row-reverse overflow-hidden py-3">
            <Markdown className="mx-4 h-full flex-1 overflow-y-auto overflow-x-hidden" />
            <Explorer />
        </div>
    </WebsocketProvider>
);
