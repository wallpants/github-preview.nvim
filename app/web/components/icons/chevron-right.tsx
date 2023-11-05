import { cn } from "../../utils.ts";

type Props = {
    className?: string;
};

export const ChevronRightIcon = ({ className }: Props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className={cn("stroke-github-fg-subtle", className)}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);
