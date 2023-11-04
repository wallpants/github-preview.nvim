import { useState, type FC } from "react";
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

    if (!selected) return null;

    return (
        <div className="relative z-20 flex flex-col items-center">
            <IconButton
                Icon={selected.icon}
                buttonClassName="peer"
                iconClassName={selected.iconClassName}
                disabled={Boolean(disabled)}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
            />
            {disabled && (
                <div className="absolute left-[120%] top-0 hidden w-56 rounded-md border border-orange-600 bg-github-canvas-subtle peer-hover:block">
                    <p className="!m-3">{disabled}</p>
                </div>
            )}
            {isOpen && (
                <div className="absolute top-0 flex flex-col">
                    {select
                        .sort((option) => (option.selected ? -1 : 1))
                        .map((option) => (
                            <IconButton
                                key={option.label}
                                label={option.label}
                                buttonClassName="mb-0.5 bg-github-canvas-default"
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
