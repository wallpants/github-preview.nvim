import { useContext } from "react";
import { websocketContext } from "../../../websocket-provider/context";
import { Option } from "../option";

type Props = {
    setIsSelectingColor: (s: boolean) => void;
};

export const CursorlineOption = ({ setIsSelectingColor }: Props) => {
    const { wsRequest, config } = useContext(websocketContext);

    if (!config) return null;
    const { overrides } = config;

    return (
        <Option
            className="h-40"
            name="cursorline"
            cKey="cursor_line"
            toggle={{
                value: !overrides.cursor_line.disable,
                onChange: () => {
                    wsRequest({
                        type: "update_config",
                        action: ["cursorline", "toggle"],
                    });
                },
            }}
            color={{
                value: overrides.cursor_line.color,
                setIsSelectingColor: setIsSelectingColor,
                onChange: (color) => {
                    wsRequest({
                        type: "update_config",
                        action: ["cursorline.color", color],
                    });
                },
            }}
            range={{
                value: overrides.cursor_line.opacity,
                min: 0,
                max: 1,
                step: 0.1,
                onChange: (opacity) => {
                    wsRequest({
                        type: "update_config",
                        action: ["cursorline.opacity", opacity],
                    });
                },
            }}
        />
    );
};
