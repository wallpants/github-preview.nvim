import { useContext, useEffect, type ChangeEvent } from "react";
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
        setIsSelectingColor: (b: boolean) => void;
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

    useEffect(() => {
        if (!color) return;

        // we need to do all this to handle color change instead of a simple
        // onChange handler in the input, because we need a way to know
        // when the user is picking a color (the native color picker is showing)
        // and when they're done picking. we need to know this to prevent
        // the settings modal from closing whilst the user is picking a color.
        //
        // According to mozilla: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color#result
        // the way to know this is to have a handler for "input" and a handler for "change"
        // added to the color input, but the react listeners onInput and onChange
        // are both triggered at the same time every time the color input value changes.

        const input = document.getElementById(`${cKey}-color`);
        if (!input) return;

        function onInput(event: ChangeEvent<HTMLInputElement>) {
            color?.onChange(event.target.value);
            color?.setIsSelectingColor(true);
        }

        function onChange(event: ChangeEvent<HTMLInputElement>) {
            color?.onChange(event.target.value);
            color?.setIsSelectingColor(false);
        }

        // eslint-disable-next-line
        input.addEventListener("input", onInput as any);
        // eslint-disable-next-line
        input.addEventListener("change", onChange as any);

        return () => {
            // eslint-disable-next-line
            input.removeEventListener("input", onInput as any);
            // eslint-disable-next-line
            input.removeEventListener("change", onChange as any);
        };
    }, [color, cKey]);

    if (!config) return null;

    const dotfiles = config.dotfiles[cKey];
    const override = config.overrides[cKey];
    const isOverriden = !isEqual(dotfiles, override);

    return (
        <div
            className={cn(
                "relative min-w-[120px] flex p-3 h-28 flex-col items-center rounded border border-github-border-default",
                className,
            )}
        >
            {isOverriden ? (
                <div className="absolute right-1 top-1 size-2 rounded-full bg-orange-600" />
            ) : null}
            <p className="!m-0">{name}</p>
            <div className="flex grow flex-col items-center justify-around py-1">
                {toggle && <Toggle checked={toggle.value} onChange={toggle.onChange} />}
                {select && <Select select={select} disabled={disabled} />}
                {color && (
                    <label className="flex items-center gap-x-4 text-[14px]">
                        <input
                            type="color"
                            id={`${cKey}-color`}
                            className="h-6"
                            defaultValue={color.value}
                            disabled={toggle?.value === false}
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
            {disabled && (
                <div className="hover:bg-github-canvas-subtle group absolute inset-0 cursor-not-allowed rounded">
                    <div className="invisible absolute inset-0 flex items-center bg-orange-200/10 group-hover:visible">
                        <p className="!m-0 text-center text-orange-600">{disabled}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
