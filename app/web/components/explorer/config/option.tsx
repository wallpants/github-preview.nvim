import { useContext } from "react";
import { type GithubPreview } from "../../../../github-preview";
import { cn, isEqual } from "../../../utils";
import { Toggle } from "../../toggle";
import { websocketContext } from "../../websocket-provider/context";
import { Select, type SelectOption } from "./select";

type Props = {
    className?: string;
    name: string;
    cKey: keyof GithubPreview["config"]["overrides"];
    select?: SelectOption[];
    toggle?: {
        value: boolean;
        onChange: (v: boolean) => void;
    };
    color?: {
        value: string;
        onChange: (v: string) => void;
    };
    range?: {
        value: number;
        min: number;
        max: number;
        step: number;
        onChange: (value: number) => void;
    };
    disabled?: string | undefined;
};

export const Option = ({
    name,
    cKey,
    select,
    color,
    toggle,
    range,
    className,
    disabled,
}: Props) => {
    const { config } = useContext(websocketContext);
    if (!config) return null;

    const dotfiles = config.dotfiles[cKey];
    const override = config.overrides[cKey];
    const isOverriden = !isEqual(dotfiles, override);

    return (
        <div
            className={cn(
                "relative flex p-3 h-28 flex-col items-center justify-between rounded border border-github-border-default",
                className,
            )}
        >
            {isOverriden ? (
                <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-600" />
            ) : null}
            <p className="!m-0">{name}</p>
            {toggle && <Toggle checked={toggle.value} onChange={toggle.onChange} />}
            {select && <Select select={select} disabled={disabled} />}
            {color && (
                <label className="flex items-center gap-x-4 text-[14px]">
                    <input
                        type="color"
                        className="h-6"
                        value={color.value}
                        disabled={toggle?.value === false}
                        onChange={(e) => {
                            color.onChange(e.target.value);
                        }}
                    />
                    {color.value}
                </label>
            )}
            {range && (
                <div className="flex gap-x-3">
                    <input
                        type="range"
                        className="w-24"
                        disabled={toggle?.value === false}
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
