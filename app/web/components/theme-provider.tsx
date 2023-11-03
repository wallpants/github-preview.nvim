import { type Mermaid } from "mermaid";
import { useContext, useEffect, type ReactNode } from "react";
import { websocketContext } from "./websocket-provider/context";

declare const mermaid: Mermaid;

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { config } = useContext(websocketContext);
    const theme = config?.overrides.theme;

    function getSystemTheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    useEffect(() => {
        function handleThemeChange(newTheme: "light" | "dark") {
            const rootHtml = document.getElementsByTagName("html")[0]!;
            rootHtml.className = `pantsdown ${newTheme}`;
            mermaid.initialize({
                startOnLoad: false,
                theme: newTheme === "light" ? "default" : "dark",
            });
        }

        if (theme) {
            if (theme === "system") handleThemeChange(getSystemTheme());
            else handleThemeChange(theme);
        }
    }, [theme]);

    return children;
}
