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
                "mx-auto my-0 box-border min-h-[100px] min-w-[200px] max-w-[980px] overflow-hidden rounded border border-border-default",
                className,
            )}
        >
            {children}
        </div>
    );
};
