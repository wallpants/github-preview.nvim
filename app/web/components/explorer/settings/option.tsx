import { useContext } from "react";
import { type GithubPreview } from "../../../../github-preview";
import { cn, isEqual } from "../../../utils";
import { Select, type SelectOption } from "../../select";
import { Toggle } from "../../toggle";
import { websocketContext } from "../../websocket-provider/context";

type Props = {
    className?: string;
    name: string;
    cKey: keyof GithubPreview["config"]["overrides"];
    disabled?: string;
    select?: {
        selected: SelectOption;
        options: SelectOption[];
        onChange: (s: SelectOption) => void;
    };
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
};

export const Option = ({
    name,
    cKey,
    disabled,
    select,
    color,
    toggle,
    range,
    className,
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
            {select && (
                <Select
                    selected={select.selected}
                    options={select.options}
                    onChange={select.onChange}
                />
            )}
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
            {disabled && (
                <div className="group absolute inset-0 cursor-not-allowed rounded hover:bg-github-canvas-subtle">
                    <div className="invisible absolute inset-0 flex items-center bg-orange-200/10 group-hover:visible">
                        <p className="!m-0 text-center text-orange-600">{disabled}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
