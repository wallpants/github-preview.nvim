import { useContext, useMemo } from "react";
import { websocketContext } from "../../websocket-context/context.ts";
import { Container } from "../container.tsx";
import { EntryComponent } from "./entry.tsx";

export const Explorer = () => {
    const { navigate, currentPath, state } = useContext(websocketContext);

    const parent = useMemo(() => {
        if (!state.current?.root || !currentPath) return;

        const relative = currentPath.slice(state.current.root.length);
        const segments = relative.split("/");

        if (segments.length <= 1) return;

        segments.pop();
        segments.pop();

        let parent = state.current.root + segments.join("/");

        // parent is always a dir, must end with "/"
        if (!parent.endsWith("/")) parent += "/";
        return parent;
    }, [state, currentPath]);

    return (
        <Container>
            {parent && <EntryComponent absPath={parent} navigate={navigate} isParent />}
            {state.current?.entries?.map((entry) => (
                <EntryComponent key={entry} absPath={entry} navigate={navigate} />
            ))}
        </Container>
    );
};
