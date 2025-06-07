import { useEffect, useState, type FC } from "react";
import { cn } from "../../../utils";
import { IconButton } from "../../icon-button";

export type SelectOption = {
    label: string;
    selected: boolean;
    onClick: () => void;
    icon: FC<{ className: string }>;
    iconClassName?: string;
};

type Props = {
    select: SelectOption[];
    disabled?: string | undefined;
};

export const Select = ({ select, disabled }: Props) => {
    const selected = select.find((option) => option.selected);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // kind of a hack to close dropdown on settings modal click
        // this relies on `tick` in settings/index.tsx
        setIsOpen(false);
    }, [select]);

    if (!selected) return null;

    return (
        <div className="relative z-20 flex flex-col items-center">
            <IconButton
                Icon={selected.icon}
                className="bg-github-canvas-default peer"
                iconClassName={selected.iconClassName}
                disabled={Boolean(disabled)}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            />
            {disabled && (
                <div className="bg-github-canvas-subtle absolute left-[120%] top-0 hidden w-56 rounded-md border border-orange-600 peer-hover:block">
                    <p className="!m-3">{disabled}</p>
                </div>
            )}
            {isOpen && (
                <div className="absolute top-0 flex flex-col">
                    {select.map((option) => (
                        <IconButton
                            key={option.label}
                            label={option.label}
                            className={cn(
                                "mb-0.5 bg-github-canvas-default",
                                option.selected && "border-orange-600",
                            )}
                            Icon={option.icon}
                            iconClassName={option.iconClassName}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                                option.onClick();
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
