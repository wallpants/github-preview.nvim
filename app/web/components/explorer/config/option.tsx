import { type GithubPreview } from "../../../../github-preview";
import { isMatch } from "../../../utils";
import { ThemePicker } from "./theme-picker";

type Props = {
    name: string;
    config: GithubPreview["config"];
    cKey: keyof GithubPreview["config"]["overrides"];
};

export const Option = ({ name, config, cKey }: Props) => {
    const dotfiles = config.dotfiles[cKey];
    const override = config.overrides[cKey];
    const isOverriden = !isMatch(dotfiles, override);

    return (
        <div className="relative flex h-28 flex-col items-center space-y-2 rounded border border-github-border-default">
            {isOverriden ? (
                <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-600" />
            ) : null}
            <p className="!my-2">{name}</p>
            <ThemePicker />
        </div>
    );
};
