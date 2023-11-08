import { useContext } from "react";
import { websocketContext } from "../../../websocket-provider/context";
import { Option } from "../option";

export const ScrollOption = () => {
    const { wsRequest, config } = useContext(websocketContext);

    if (!config) return null;
    const { overrides } = config;

    return (
        <Option
            className="h-40"
            name="scroll"
            cKey="scroll"
            toggle={{
                value: !overrides.scroll.disable,
                onChange: () => {
                    wsRequest({
                        type: "update_config",
                        action: ["scroll", "toggle"],
                    });
                },
            }}
            range={{
                value: overrides.scroll.top_offset_pct,
                min: 0,
                max: 100,
                step: 1,
                onChange: (top_offset_pct) => {
                    wsRequest({
                        type: "update_config",
                        action: ["scroll.offset", top_offset_pct],
                    });
                },
            }}
        />
    );
};
