import { type FC } from "react";
import { cn } from "./utils.ts";

type Props = {
    Icon: FC<{ className: string }>;
    onClick: React.MouseEventHandler<HTMLElement>;
    className?: string;
    noBorder?: boolean;
};

export const IconButton = ({ Icon, onClick, className, noBorder }: Props) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex h-10 w-10 items-center justify-center",
                "rounded-md border  hover:bg-github-canvas-subtle",
                noBorder ? "border-none" : "border-github-border-default",
                className,
            )}
        >
            <Icon className="h-6 w-6" />
        </button>
    );
};
