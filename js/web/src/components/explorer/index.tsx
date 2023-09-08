import { useContext, useMemo } from "react";
import { websocketContext } from "../../websocket-context/context";
import { Container } from "../container";
import { ThemePicker } from "../theme-select";
import { EntryComponent } from "./entry";

export const Explorer = () => {
    const { navigate, state } = useContext(websocketContext);

    const parent = useMemo(() => {
        if (!state.current?.root || !state.current.currentPath) return;

        const relative = state.current.currentPath.slice(state.current.root.length);
        const segments = relative.split("/");

        if (segments.length <= 1) return;

        segments.pop();
        segments.pop();

        let parent = state.current.root + segments.join("/");

        // parent is always a dir, must end with "/"
        if (!parent.endsWith("/")) parent += "/";
        return parent;
    }, [state]);

    const [username, repo] = state.current?.repoName?.split("/") ?? "";

    return (
        <div>
            <Container className="border-none">
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
            </Container>
            <Container>
                {parent && (
                    <EntryComponent absPath={parent} navigate={navigate} isParent />
                )}
                {state.current?.entries?.map((entry) => (
                    <EntryComponent key={entry} absPath={entry} navigate={navigate} />
                ))}
            </Container>
        </div>
    );
};
