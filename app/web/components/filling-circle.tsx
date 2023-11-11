import { cn } from "../utils";

type Props = {
    className?: string;
    background?: string;
    fillBackground?: string;
    animate?: boolean;
    durationSecs: number;
};

export const FillingCircle = ({
    className,
    animate,
    background,
    fillBackground,
    durationSecs,
}: Props) => (
    <svg
        style={{ background: fillBackground ?? "blue" }}
        className={cn("rounded-full h-12 w-12", className)}
    >
        <circle
            stroke={background ?? "red"}
            fill="transparent"
            strokeWidth={150}
            strokeDasharray={471}
            strokeDashoffset={0}
            style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                animation: animate ? `clock-animation ${durationSecs}s linear` : undefined,
            }}
            cx="50%"
            cy="50%"
            r="75"
        />
    </svg>
);
