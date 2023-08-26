import { type ReactNode } from "react";
import { cn } from "../lib/styles";

type Props = {
    children?: ReactNode[] | ReactNode;
    className?: string;
    markdownElementId?: string;
};

export const Container = ({
    className,
    children,
    markdownElementId,
}: Props) => {
    return (
        <div
            id={markdownElementId}
            className={cn(
                "mx-auto my-0 border-border-default box-border min-w-[200px] max-w-[980px] border rounded",
                className,
            )}
        >
            {children}
        </div>
    );
};
