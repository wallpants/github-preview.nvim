import { cn } from "../utils";

type Props = {
    className?: string;
    background?: string;
    fillBackground?: string;
    animate?: boolean;
};

export const FillingCircle = ({ className, animate, background, fillBackground }: Props) => (
    <svg style={{ background }} className={cn("rounded-full h-12 w-12", className)}>
        <circle
            stroke={fillBackground ?? "#0063b2"}
            fill="transparent"
            strokeWidth={150}
            strokeDasharray={471}
            // strokeDashoffset={471}
            strokeDashoffset={0}
            style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                animation: animate ? "clock-animation 2.5s linear" : undefined,
            }}
            cx="50%"
            cy="50%"
            r="75"
        />
    </svg>
);
