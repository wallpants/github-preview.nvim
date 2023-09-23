import { useContext } from "react";
import { websocketContext } from "../websocket-context/context.ts";
import { ThemePicker } from "./theme-select.tsx";

export const Header = () => {
    const { state } = useContext(websocketContext);

    const [username, repo] = state.current?.repoName?.split("/") ?? "";

    return (
        <div>
            <h1>Header</h1>
            <ThemePicker />
            <div className="flex">
                {username && (
                    <img
                        src={`https://github.com/${username}.png?size=48`}
                        className="mb-4 mr-2 mt-6 h-6 w-6 rounded-[100%]"
                    />
                )}
                <h3>{repo}</h3>
            </div>
        </div>
    );
};
