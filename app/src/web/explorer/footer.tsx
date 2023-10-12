import { ThemePicker } from "../theme-picker/index.tsx";
import { cn } from "../utils.ts";

export const Footer = ({ isExpanded }: { isExpanded: boolean }) => (
    <div
        className={cn(
            "absolute bottom-0 flex h-14 inset-x-0 items-center justify-center",
            "border-t border-github-border-default bg-github-canvas-default",
        )}
    >
        {isExpanded && (
            <p className="!mb-0 mr-4 text-center text-sm">
                with ♥️ by{" "}
                <a href="https://wallpants.io" target="_blank" rel="noreferrer">
                    wallpants.io
                </a>
            </p>
        )}
        <ThemePicker noBorder={!isExpanded} />
    </div>
);
