import { useContext, useMemo } from "react";
import { websocketContext } from "../../websocket-context/context";
import { Container } from "../container";
import { EXPLORER_ELE_ID } from "../markdown/markdown-it/scroll";
import { ThemePicker } from "../theme-select";
import { EntryComponent } from "./entry";

export const Explorer = () => {
    const { navigate, root, currentPath, repoName, entries } = useContext(websocketContext);

    const parent = useMemo(() => {
        if (!root || !currentPath) return;

        const relative = currentPath.slice(root.length);
        const segments = relative.split("/");

        if (segments.length <= 1) return;

        segments.pop();
        segments.pop();

        let parent = root + segments.join("/");

        // parent is always a dir, must end with "/"
        if (!parent.endsWith("/")) parent += "/";
        return parent;
    }, [root, currentPath]);

    const [username, repo] = repoName?.split("/") ?? "";

    return (
        <div id={EXPLORER_ELE_ID}>
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
                {parent && <EntryComponent absPath={parent} navigate={navigate} isParent />}
                {entries?.map((entry) => (
                    <EntryComponent key={entry} absPath={entry} navigate={navigate} />
                ))}
            </Container>
        </div>
    );
};
