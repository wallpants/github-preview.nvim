import { Explorer } from "./components/explorer";
import { Markdown } from "./components/markdown";
import { ThemePicker } from "./components/theme-select";

function App() {
    return (
        <div className={"relative h-full w-full p-8"}>
            <ThemePicker />
            <Explorer />
            <Markdown className="mt-4" />
        </div>
    );
}

export default App;
