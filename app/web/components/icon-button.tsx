import { type ButtonHTMLAttributes, type FC } from "react";
import { cn } from "../utils.ts";

type Props = {
    Icon: FC<{ className: string }>;
    iconClassName?: string | undefined;
    noBorder?: boolean;
    label?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton = ({
    Icon,
    onClick,
    className,
    iconClassName,
    noBorder,
    label,
    disabled,
    ...rest
}: Props) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            {...rest}
            className={cn(
                "flex p-2 items-center rounded-md border",
                noBorder ? "border-none" : "border-github-border-default",
                disabled ? "bg-github-border-default" : "hover:bg-github-border-muted",
                className,
            )}
        >
            <Icon className={cn("h-6 w-6", iconClassName)} />
            {label && <span className="ml-2">{label}</span>}
        </button>
    );
};
