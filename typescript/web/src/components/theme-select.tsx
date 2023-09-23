import { useEffect, useState } from "react";

type Theme = "dark" | "light";
type Selected = Theme | "system";

const local = localStorage.getItem("override") as Theme | null;

function getSystemTheme(): Theme {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemePicker() {
    const [selected, setSelected] = useState<Selected>(local ?? "system");
    const [system, setSystem] = useState<Theme>(getSystemTheme());
    const [override, setOverride] = useState<Theme | null>(local);

    const theme = override ?? system;

    useEffect(() => {
        function handleThemeChange(theme: Theme) {
            const rootHtml = document.getElementsByTagName("html")[0];
            if (rootHtml) rootHtml.className = `github-styles ${theme}`;
        }

        handleThemeChange(theme);
    }, [theme]);

    useEffect(() => {
        if (selected === "system") {
            localStorage.removeItem("override");
            setOverride(null);
        } else {
            localStorage.setItem("override", selected);
            setOverride(selected);
        }
    }, [selected]);

    useEffect(() => {
        function eventHandler({ matches }: { matches: boolean }) {
            const newTheme = matches ? "dark" : "light";
            setSystem(newTheme);
        }

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", eventHandler);

        return () => {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", eventHandler);
        };
    }, [override]);

    return (
        <div>
            <span className="mx-6">Theme</span>
            <select
                value={selected}
                onChange={(e) => {
                    setSelected(e.target.value as Selected);
                }}
            >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>
    );
}
