import { useContext } from "react";
import { type GithubPreview } from "../../../../github-preview";
import { cn, isEqual } from "../../../utils";
import { websocketContext } from "../../websocket-provider/context";
import { Select, type SelectOption } from "./select";

type Props = {
    className?: string;
    name: string;
    cKey: keyof GithubPreview["config"]["overrides"];
    select?: SelectOption[];
    color?: {
        value: string;
        onChange: (color: string) => void;
    };
    range?: {
        value: number;
        min: number;
        max: number;
        step: number;
        onChange: (value: number) => void;
    };
};

export const Option = ({ name, cKey, select, color, range, className }: Props) => {
    const { config } = useContext(websocketContext);
    if (!config) return null;

    const dotfiles = config.dotfiles[cKey];
    const override = config.overrides[cKey];
    const isOverriden = !isEqual(dotfiles, override);

    return (
        <div
            className={cn(
                "relative flex h-28 flex-col items-center space-y-2 rounded border border-github-border-default",
                className,
            )}
        >
            {isOverriden ? (
                <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-600" />
            ) : null}
            <p className="!my-2">{name}</p>
            {select && <Select select={select} />}
            {color && (
                <div className="flex gap-x-3">
                    <input
                        type="color"
                        className="h-6"
                        value={color.value}
                        onChange={(e) => {
                            color.onChange(e.target.value);
                        }}
                    />
                    <span>{color.value}</span>
                </div>
            )}
            {range && (
                <div className="flex gap-x-3">
                    <input
                        type="range"
                        className="w-24"
                        value={range.value}
                        min={range.min}
                        max={range.max}
                        step={range.step}
                        onChange={(e) => {
                            range.onChange(Number(e.target.value));
                        }}
                    />
                    <span className="ml-2 w-6 text-right">{range.value}</span>
                </div>
            )}
        </div>
    );
};
