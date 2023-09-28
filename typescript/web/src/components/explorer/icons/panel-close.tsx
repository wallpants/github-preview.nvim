import { cn } from "../../../utils.ts";

type Props = {
    className?: string;
};

export const PanelCloseIcon = ({ className }: Props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("stroke-github-fg-subtle", className)}
    >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="15" x2="15" y1="3" y2="21" />
        <path d="m8 9 3 3-3 3" />
    </svg>
);
