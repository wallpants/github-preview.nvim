import { type Mermaid } from "mermaid";
import { useContext, useLayoutEffect, type ReactNode } from "react";
import { type Theme } from "../../types";
import { websocketContext } from "./websocket-provider/context";

declare const mermaid: Mermaid;

export function ThemeProvider({ children, THEME }: { children: ReactNode; THEME: Theme }) {
    const { wsRequest, currentPath, config } = useContext(websocketContext);
    const theme = config?.overrides.theme ?? THEME;

    function getSystemTheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    useLayoutEffect(() => {
        function handleThemeChange(newTheme: "light" | "dark") {
            const rootHtml = document.getElementsByTagName("html")[0]!;
            rootHtml.className = `pantsdown ${newTheme}`;
            mermaid.initialize({
                startOnLoad: false,
                theme: newTheme === "light" ? "default" : "dark",
            });
            if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
        }

        if (theme === "system") handleThemeChange(getSystemTheme());
        else handleThemeChange(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, wsRequest]);

    return children;
}
