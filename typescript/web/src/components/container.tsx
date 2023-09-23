import { type ReactNode } from "react";
import { cn } from "../utils.ts";

type Props = {
    children?: ReactNode[] | ReactNode;
    className?: string;
};

export const Container = ({ className, children }: Props) => {
    return (
        <div
            className={cn(
                "relative box-border rounded border",
                "border-github-border-default bg-github-canvas-default",
                className,
            )}
        >
            {children}
        </div>
    );
};
