import { Explorer } from "./components/explorer/index.tsx";
import { Markdown } from "./components/markdown/index.tsx";
import { WebsocketProvider } from "./components/websocket-provider/provider.tsx";

export const App = () => (
   <WebsocketProvider>
      <div className="flex h-screen min-h-[300px] w-screen flex-row-reverse overflow-hidden py-3">
         <Markdown className="mx-4 h-full flex-1 overflow-x-hidden overflow-y-auto" />
         <Explorer />
      </div>
   </WebsocketProvider>
);
