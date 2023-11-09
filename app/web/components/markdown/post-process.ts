import { type Config } from "../../../types";
import { type WebsocketContext } from "../websocket-provider/context";

type Props = {
    wsRequest: WebsocketContext["wsRequest"];
    markdownElement: HTMLElement;
    single_file: Config["single_file"] | undefined;
};

export function postProcessMarkdown({ wsRequest, markdownElement, single_file }: Props) {
    // handle links
    const base = window.location.origin + "/";
    markdownElement.querySelectorAll("a").forEach((element) => {
        if (!element.href.startsWith(base)) {
            // if link is not relative, fallback to default behaviour
            return;
        }

        // override onClick on relative links
        element.addEventListener("click", (event) => {
            event.preventDefault();
            const pathname = element.href.slice(base.length);
            wsRequest({ type: "get_entry", path: pathname });
        });

        // overrides applicable to single-file mode
        if (!single_file) return;

        // if relative link points to an anchor in currentPath, do nothing
        // and fallback to default behaviour
        const currentUrl = window.location.origin + window.location.pathname;
        if (element.href.slice(currentUrl.length).startsWith("#")) {
            return;
        }

        // add "disabled" tooltip if single-file mode
        element.style.setProperty("position", "relative");
        element.classList.add("group");
        const tooltip = document.createElement("div");
        tooltip.style.setProperty("position", "absolute");
        tooltip.style.setProperty("top", "-10px");
        tooltip.style.setProperty("left", "110%");
        tooltip.style.setProperty("z-index", "10");

        const innerHTML =
            '<div class="group-hover:bg-github-canvas-subtle border group-hover:block rounded-md group-hover:border-orange-600 hidden" style="width: 200px;">' +
            '<p class="!m-0 p-2 text-sm text-github-fg-default">relative links are disabled in single-file mode.</p>' +
            "</div>";
        tooltip.innerHTML = innerHTML;
        element.appendChild(tooltip);
    });
}
