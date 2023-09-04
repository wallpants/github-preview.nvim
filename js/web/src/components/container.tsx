import { type ReactNode } from "react";
import { cn } from "../lib/styles";

type Props = {
    children?: ReactNode[] | ReactNode;
    className?: string;
    markdownElementId?: string;
};

export const Container = ({ className, children, markdownElementId }: Props) => {
    return (
        <div
            id={markdownElementId}
            className={cn(
                "mx-auto my-0 mb-6 box-border overflow-hidden rounded border",
                "min-h-[38px] min-w-[200px] max-w-[980px]",
                "border-github-border-default bg-github-canvas-default",
                className,
            )}
        >
            {children}
        </div>
    );
};
