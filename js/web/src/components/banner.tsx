import { useContext } from "react";
import { cn } from "../utils";
import { websocketContext } from "../websocket-context/context";
import { Container } from "./container";

type Props = {
    className?: string;
};

export const Banner = ({ className }: Props) => {
    const { isConnected } = useContext(websocketContext);

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
                <span className="mr-2 font-semibold">Banner</span>
                {isConnected ? "connected" : "trying to connect"}
            </div>
        </Container>
    );
};
