import { useContext } from "react";
import { FoldVerticalIcon } from "../../../icons/fold-vertical";
import { UnfoldVerticalIcon } from "../../../icons/unfold-vertical";
import { websocketContext } from "../../../websocket-provider/context";
import { Option } from "../option";
import { type SelectOption } from "../select";

export const DetailsTagsOption = () => {
    const { wsRequest, config } = useContext(websocketContext);

    if (!config) return null;
    const { overrides } = config;

    const detailsSelect: SelectOption[] = [
        {
            label: "open",
            icon: UnfoldVerticalIcon,
            iconClassName: "stroke-github-success-fg",
            selected: overrides.details_tags_open,
            onClick: () => {
                wsRequest({ type: "update_config", action: ["details_tags", "open"] });
            },
        },
        {
            label: "close",
            icon: FoldVerticalIcon,
            selected: !overrides.details_tags_open,
            onClick: () => {
                wsRequest({ type: "update_config", action: ["details_tags", "closed"] });
            },
        },
    ];

    return (
        <Option className="h-36" name="<details>" cKey="details_tags_open" select={detailsSelect} />
    );
};
