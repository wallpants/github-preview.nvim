import { type Dispatch, type SetStateAction } from "react";
import { type Config } from "../../../../types";
import { cn } from "../../../utils";
import { CollapsedOption } from "./collapsed-option";

type Props = {
    className?: string;
    setSettingsOffset: (o: number) => void;
    setConfigOpen: Dispatch<SetStateAction<null | keyof Config | "no-key">>;
    configOpen: null | keyof Config | "no-key";
    startExit: boolean;
};

export const CollapsedSettings = ({
    className,
    setSettingsOffset,
    setConfigOpen,
    configOpen,
    startExit,
}: Props) => (
    <div className={cn("absolute inset-0 overflow-y-hidden", className)}>
        <div className="absolute inset-x-0 top-24 flex flex-col justify-center gap-y-3">
            <CollapsedOption
                className="mb-20"
                setSettingsOffset={setSettingsOffset}
                setConfigOpen={setConfigOpen}
                active={"single_file" === configOpen}
                cKey="single_file"
                startExit={startExit}
            />
            <CollapsedOption
                setSettingsOffset={setSettingsOffset}
                setConfigOpen={setConfigOpen}
                active={"scroll" === configOpen}
                cKey="scroll"
                startExit={startExit}
            />
            <CollapsedOption
                setSettingsOffset={setSettingsOffset}
                setConfigOpen={setConfigOpen}
                active={"cursor_line" === configOpen}
                cKey="cursor_line"
                startExit={startExit}
            />
            <CollapsedOption
                setSettingsOffset={setSettingsOffset}
                setConfigOpen={setConfigOpen}
                active={"details_tags_open" === configOpen}
                cKey="details_tags_open"
                startExit={startExit}
            />
            <CollapsedOption
                setSettingsOffset={setSettingsOffset}
                setConfigOpen={setConfigOpen}
                active={"theme" === configOpen}
                cKey="theme"
                startExit={startExit}
            />
        </div>
    </div>
);
