import { createContext } from "react";

export type Theme = "dark" | "light";
export type Selected = Theme | "system";

export const websocketContext = createContext<{
    selected: Selected | undefined;
    setSelected: (theme: Selected) => void;
}>({
    selected: undefined,
    setSelected: () => null,
});
