import { useCallback, useContext, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { ThemeSchema } from "../../types";
import { myMermaid } from "./markdown/mermaid";
import { websocketContext } from "./websocket-provider/context";

const DEFAULT_THEME = ThemeSchema.parse(
   JSON.parse(
      new URLSearchParams(window.location.search).get("theme") ??
         '{ "name": "system", "high_contrast": false }',
   ),
);

export function ThemeProvider({ children }: { children: ReactNode }) {
   const { wsRequest, currentPath, config } = useContext(websocketContext);
   const theme = config?.overrides.theme.name ?? DEFAULT_THEME.name;
   const high_contrast = config?.overrides.theme.high_contrast ?? DEFAULT_THEME.high_contrast;

   function getSystemTheme() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
   }

   const handleThemeChange = useCallback(
      (newTheme: "light" | "dark") => {
         const rootHtml = document.getElementsByTagName("html")[0];
         if (!rootHtml) throw new Error("root html element not found");
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
      const handler = changeEventHandler.current;

      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handler);
      return () => {
         window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", handler);
      };
   }, [changeEventHandler]);

   return children;
}
