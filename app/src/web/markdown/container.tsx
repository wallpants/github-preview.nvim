import { type ReactNode } from "react";
import { cn } from "../utils.ts";

type Props = {
    id?: string;
    children?: ReactNode[] | ReactNode;
    className?: string;
};

export const Container = ({ id, className, children }: Props) => {
    return (
        <div
            id={id}
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
