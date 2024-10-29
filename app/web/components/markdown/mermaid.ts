import { type Mermaid, type MermaidConfig } from "mermaid";

declare const mermaid: Mermaid;

export const myMermaid = {
    memoMermaids: new Map<string, string>(),
    incId: 0,

    initialize(config: MermaidConfig) {
        this.memoMermaids = new Map();
        mermaid.initialize(config);
    },

    /**
     * renders memoized mermaids only so we can run it synchronously
     */
    renderMemoized(element?: HTMLElement) {
        const documentMermaids = (element ?? document).querySelectorAll(".mermaid");

        const memoMermaids = new Map<string, string>();
        const pendingMermaids: Element[] = [];

        for (const dMermaid of documentMermaids) {
            const renderedDefinition = dMermaid.getAttribute("data-rendered");
            if (renderedDefinition) {
                memoMermaids.set(renderedDefinition, dMermaid.innerHTML);
                continue;
            }

            const definition = dMermaid.textContent;
            if (!definition) continue;

            const svg = this.memoMermaids.get(definition);
            if (svg) {
                memoMermaids.set(definition, svg);
                dMermaid.setAttribute("data-rendered", definition);
                dMermaid.innerHTML = svg;
            } else {
                pendingMermaids.push(dMermaid);
            }
        }

        return {
            memoMermaids,
            pendingMermaids,
        };
    },

    /**
     * renders all mermaids
     * uses memoized mermaids if present and generates missing
     */
    async renderAsync() {
        const { memoMermaids, pendingMermaids } = this.renderMemoized();

        for (const dMermaid of pendingMermaids) {
            const renderedDefinition = dMermaid.getAttribute("data-rendered");

            const definition = renderedDefinition ?? dMermaid.textContent;
            if (!definition) continue;

            let svg = this.memoMermaids.get(definition);

            if (!svg) {
                try {
                    const { svg: newSvg } = await mermaid.render(
                        `mermaid-${++this.incId}`,
                        definition,
                    );
                    svg = newSvg;
                } catch (_) {
                    //
                }
            }

            if (!svg) continue;

            memoMermaids.set(definition, svg);
            dMermaid.innerHTML = svg;
        }

        this.memoMermaids = memoMermaids;
    },
};
