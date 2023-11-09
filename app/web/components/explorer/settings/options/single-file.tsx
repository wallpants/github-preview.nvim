import { useContext } from "react";
import { websocketContext } from "../../../websocket-provider/context";
import { Option } from "../option";

export const SingleFileOption = () => {
    const { wsRequest, config } = useContext(websocketContext);

    if (!config) return null;
    const { overrides } = config;

    return (
        <Option
            className="h-36"
            name="single-file"
            cKey="single_file"
            toggle={{
                value: overrides.single_file,
                onChange: () => {
                    wsRequest({
                        type: "update_config",
                        action: ["single_file", "toggle"],
                    });
                },
            }}
            disabled={
                config.dotfiles.single_file
                    ? "If plugin launched in single-file mode, it cannot be changed."
                    : undefined
            }
        />
    );
};
