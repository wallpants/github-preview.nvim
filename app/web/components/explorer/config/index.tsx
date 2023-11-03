import { useContext } from "react";
import { cn } from "../../../utils";
import { websocketContext } from "../../websocket-provider/context";
import { Option } from "./option";

export const Config = () => {
    const { config } = useContext(websocketContext);

    if (!config) return null;

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
            }}
            className={cn(
                "absolute left-14 top-[55px] z-20 w-96 p-2 text-sm",
                "rounded border border-github-border-default bg-github-canvas-subtle",
            )}
        >
            <p>
                <strong>Temporarily</strong> override your settings.
                <br />
                To persist changes, update your{" "}
                <a
                    href="https://github.com/wallpants/github-preview.nvim#setup"
                    target="_blank"
                    rel="noreferrer"
                >
                    neovim config files
                </a>
                .
            </p>
            <div className="grid grid-cols-3 gap-4">
                <Option name="Theme" cKey="theme" config={config} />
            </div>
        </div>
    );
};
