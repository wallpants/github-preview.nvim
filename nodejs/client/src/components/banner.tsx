import { useContext } from "react";
import { cn } from "../lib/styles";
import { websocketContext } from "../websocket-content/context";

type Props = {
    className?: string;
};

export const Banner = ({ className }: Props) => {
    const { status } = useContext(websocketContext);

    return (
        <div
            className={cn(
                "fixed left-1/2 top-7 -translate-x-1/2 border-github-border-default bg-github-attention-subtle",
                className,
            )}
        >
            <p>Banner</p>
            {status}
        </div>
    );
};
