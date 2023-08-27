import { type BrowserHistory } from "history";
import { createContext } from "react";

export const routerContext = createContext<BrowserHistory | null>(null);
