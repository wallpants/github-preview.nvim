import { useCallback, useContext, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { type Theme } from "../../types";
import { myMermaid } from "./markdown/mermaid";
import { websocketContext } from "./websocket-provider/context";

export function ThemeProvider({ children, THEME }: { children: ReactNode; THEME: Theme }) {
    const { wsRequest, currentPath, config } = useContext(websocketContext);
    const theme = config?.overrides.theme.name ?? THEME.name;
    const high_contrast = config?.overrides.theme.high_contrast ?? THEME.high_contrast;

    function getSystemTheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    const handleThemeChange = useCallback(
        (newTheme: "light" | "dark") => {
            const rootHtml = document.getElementsByTagName("html")[0]!;
            let className = "pantsdown " + newTheme;
            if (high_contrast) className += " high-contrast";
            rootHtml.className = className;
            myMermaid.initialize({
                startOnLoad: false,
                theme: newTheme === "light" ? "default" : "dark",
            });
            if (currentPath) wsRequest({ type: "get_entry", path: currentPath });
        },
        [currentPath, high_contrast, wsRequest],
    );

    useLayoutEffect(() => {
        if (theme === "system") handleThemeChange(getSystemTheme());
        else handleThemeChange(theme);
    }, [theme, handleThemeChange]);

    const changeEventHandler = useRef((event: MediaQueryListEvent) => {
        const newTheme = event.matches ? "dark" : "light";
        wsRequest({ type: "update_config", action: ["theme_name", "system"] });
        handleThemeChange(newTheme);
    });

    useEffect(() => {
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", changeEventHandler.current);

        return () => {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                // eslint-disable-next-line
                .removeEventListener("change", changeEventHandler.current);
        };
    }, [changeEventHandler]);

    return children;
}
