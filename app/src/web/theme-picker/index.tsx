import { type Mermaid } from "mermaid";
import { useEffect, useState, type FC } from "react";
import { IconButton } from "../icon-button.tsx";
import { MoonIcon } from "./icons/moon.tsx";
import { SunIcon } from "./icons/sun.tsx";
import { SystemIcon } from "./icons/system.tsx";

type Theme = "dark" | "light";
type Selected = Theme | "system";

const iconsMap: Record<Selected, FC<{ className: string }>> = {
    system: SystemIcon,
    light: SunIcon,
    dark: MoonIcon,
};

declare const mermaid: Mermaid;

export function ThemePicker({ noBorder }: { noBorder?: boolean }) {
    const [selected, setSelected] = useState<Selected>("system");
    const [system, setSystem] = useState<Theme>("dark");
    const [override, setOverride] = useState<Theme | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const theme = override ?? system;

    useEffect(() => {
        const local = localStorage.getItem("override") as Theme | null;
        setOverride(local);
        if (local) setSelected(local);

        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        setSystem(systemTheme);
    }, []);

    useEffect(() => {
        function handleThemeChange(theme: Theme) {
            const rootHtml = document.getElementsByTagName("html")[0]!;
            rootHtml.className = `pantsdown ${theme}`;
            mermaid.initialize({
                startOnLoad: false,
                theme: theme === "light" ? "default" : "dark",
            });
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

    useEffect(() => {
        if (!isOpen) return;
        // setup listener to close menu on click anywhere
        const controller = new AbortController();

        document.addEventListener(
            "click",
            () => {
                setIsOpen(false);
            },
            { signal: controller.signal },
        );

        return () => {
            controller.abort();
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <IconButton
                noBorder={Boolean(noBorder) && !isOpen}
                Icon={iconsMap[selected]}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            />
            {isOpen && (
                <div className="absolute bottom-full">
                    {Object.keys(iconsMap)
                        .filter((theme) => theme !== selected)
                        .map((theme) => (
                            <IconButton
                                key={theme}
                                className="bg-github-canvas-default"
                                Icon={iconsMap[theme as Selected]}
                                onClick={() => {
                                    setSelected(theme as Selected);
                                    setIsOpen(!isOpen);
                                }}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
