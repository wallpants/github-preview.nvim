import { useContext, useState } from "react";
import { type Config } from "../../../../types";
import { cn } from "../../../utils";
import { websocketContext } from "../../websocket-provider/context";
import { CursorlineOption } from "./options/cursorline";
import { DetailsTagsOption } from "./options/details-tags";
import { ScrollOption } from "./options/scroll";
import { SingleFileOption } from "./options/single-file";
import { ThemeOption } from "./options/theme";

export const Settings = ({
    isOverriden,
    cKey,
    settingsOffset,
}: {
    isOverriden: boolean;
    cKey: keyof Config | "no-key";
    settingsOffset: number;
}) => {
    const { wsRequest } = useContext(websocketContext);
    const [tick, setTick] = useState(0);

    const noKey = cKey === "no-key";

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                // a little bit of a hack to close "select" dropdowns.
                // "select" arrays above are recreated on every render, triggering
                // a rerender on components that rely on them and thus closing menus
                setTick(tick + 1);
            }}
            style={{ top: settingsOffset - 50 }}
            className={cn(
                "absolute left-14 top-[55px] z-20 p-2 text-sm",
                "rounded border border-github-border-default bg-github-canvas-subtle",
                noKey && "w-[430px]",
            )}
        >
            {noKey && (
                <p className="!mb-6">
                    <strong>Temporarily</strong> override your settings.
                    <br />
                    To persist changes, update your{" "}
                    <a
                        href="https://github.com/wallpants/github-preview.nvim#%EF%B8%8F-setup"
                        target="_blank"
                        rel="noreferrer"
                    >
                        neovim config files
                    </a>
                    .
                </p>
            )}
            <div className={cn(noKey ? "grid grid-cols-3 gap-4 mb-4" : "flex justify-center")}>
                {(noKey || cKey === "theme") && <ThemeOption />}
                {(noKey || cKey === "details_tags_open") && <DetailsTagsOption />}
                {(noKey || cKey === "single_file") && <SingleFileOption />}
            </div>

            <div className={cn(noKey ? "grid grid-cols-2 gap-4" : "flex justify-center")}>
                {(noKey || cKey === "cursor_line") && <CursorlineOption />}
                {(noKey || cKey === "scroll") && <ScrollOption />}
            </div>
            {noKey && (
                <button
                    className={cn(
                        "float-right mb-2 mr-2 mt-4 text-orange-600 px-2 py-1 rounded-md",
                        "hover:bg-orange-600/10",
                        isOverriden ? "visible" : "invisible",
                    )}
                    onClick={() => {
                        wsRequest({ type: "update_config", action: ["clear_overrides"] });
                    }}
                >
                    clear overrides
                </button>
            )}
        </div>
    );
};
