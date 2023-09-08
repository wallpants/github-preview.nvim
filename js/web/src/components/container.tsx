import { type ReactNode } from "react";
import { cn } from "../utils";

type Props = {
    children?: ReactNode[] | ReactNode;
    className?: string;
};

export const Container = ({ className, children }: Props) => {
    return (
        <div
            className={cn(
                "mx-auto my-0 mb-6 box-border overflow-hidden rounded border",
                "relative min-h-[38px] min-w-[200px] max-w-[980px]",
                "border-github-border-default bg-github-canvas-default",
                className,
            )}
        >
            {children}
        </div>
    );
};
