import { type FC } from "react";
import { cn } from "../utils.ts";

type Props = {
    Icon: FC<{ className: string }>;
    onClick?: React.MouseEventHandler<HTMLElement>;
    buttonClassName?: string;
    iconClassName?: string | undefined;
    noBorder?: boolean;
    label?: string;
    disabled?: boolean;
};

export const IconButton = ({
    Icon,
    onClick,
    buttonClassName,
    iconClassName,
    noBorder,
    label,
    disabled,
}: Props) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex p-2 items-center rounded-md border",
                noBorder ? "border-none" : "border-github-border-default",
                disabled ? "bg-github-border-default" : "hover:bg-github-border-default",
                buttonClassName,
            )}
        >
            <Icon className={cn("h-6 w-6", iconClassName)} />
            {label && <span className="ml-2">{label}</span>}
        </button>
    );
};
