import { Switch } from "@headlessui/react";
import { cn } from "../utils";
import { CheckIcon } from "./icons/check";
import { CloseIcon } from "./icons/close";

type Props = {
    checked: boolean;
    onChange: (v: boolean) => void;
    className?: string;
};

export const Toggle = ({ checked, onChange, className }: Props) => (
    <Switch
        checked={checked}
        onChange={onChange}
        className={cn(
            checked ? "bg-green-600" : "bg-github-border-default",
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 !border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white",
            className,
        )}
    >
        <span className="sr-only">Use setting</span>
        <span
            className={cn(
                checked ? "translate-x-5" : "translate-x-0",
                "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            )}
        >
            <span
                className={cn(
                    checked
                        ? "opacity-0 duration-100 ease-out"
                        : "opacity-100 duration-200 ease-in",
                    "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                )}
                aria-hidden="true"
            >
                <CloseIcon className="!h-3 !w-3 text-gray-600" />
            </span>
            <span
                className={cn(
                    checked
                        ? "opacity-100 duration-200 ease-in"
                        : "opacity-0 duration-100 ease-out",
                    "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                )}
                aria-hidden="true"
            >
                <CheckIcon className="!h-3 !w-3 text-green-600" />
            </span>
        </span>
    </Switch>
);
