import { useLocation } from "react-router-dom";
import { Explorer } from "./components/explorer";
import { Markdown } from "./components/markdown";
import { ThemePicker } from "./components/theme-select";

export function App() {
    const location = useLocation();
    console.log("location: ", location);

    return (
        <div className={"relative h-full w-full p-8"}>
            <ThemePicker />
            <Explorer />
            <Markdown className="mt-4" />
        </div>
    );
}
