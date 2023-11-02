import { useEffect } from "react";

type Props = {
    disabled: boolean;
    callback: () => void;
};

export const useOnDocumentClick = ({ disabled, callback }: Props) => {
    useEffect(() => {
        if (disabled) return;
        const controller = new AbortController();

        document.addEventListener(
            "click",
            () => {
                callback();
            },
            { signal: controller.signal },
        );

        return () => {
            controller.abort();
        };
    }, [disabled, callback]);

    return null;
};
