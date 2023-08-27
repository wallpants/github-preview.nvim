import { useContext } from "react";
import { cn } from "../lib/styles";
import { websocketContext } from "../websocket-content/context";
import { Container } from "./container";

type Props = {
    className?: string;
};

export const Banner = ({ className }: Props) => {
    const { status } = useContext(websocketContext);

    // if (status !== "reconnecting") return null;

    return (
        <Container
            className={cn(
                "fixed left-1/2 top-7 h-16 -translate-x-1/2",
                "min-h-0 border text-sm",
                "border-github-attention-muted bg-github-canvas-subtle",
                className,
            )}
        >
            <div className="absolute inset-0 flex items-center bg-github-attention-subtle px-4">
                <span className="font-semibold">Banner</span>
                {status}
            </div>
        </Container>
    );
};
