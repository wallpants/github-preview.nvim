import { useContext, useLayoutEffect, type ReactNode } from "react";
import { type Theme } from "../../types";
import { mermaidInit } from "./markdown/mermaid";
import { websocketContext } from "./websocket-provider/context";

export function ThemeProvider({ children, THEME }: { children: ReactNode; THEME: Theme }) {
    const { wsRequest, currentPath, config } = useContext(websocketContext);
    const theme = config?.overrides.theme.name ?? THEME.name;
    const high_contrast = config?.overrides.theme.high_contrast ?? THEME.high_contrast;

    function getSystemTheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    useLayoutEffect(() => {
        function handleThemeChange(newTheme: "light" | "dark") {
            const rootHtml = document.getElementsByTagName("html")[0]!;
            let className = "pantsdown " + newTheme;
            if (high_contrast) className += " high-contrast";
            rootHtml.className = className;
            mermaidInit({
                startOnLoad: false,
                theme: newTheme === "light" ? "default" : "dark",
            });
            if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
        }

        if (theme === "system") handleThemeChange(getSystemTheme());
        else handleThemeChange(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, high_contrast, wsRequest]);

    return children;
}
