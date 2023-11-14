import { type Mermaid, type MermaidConfig } from "mermaid";

declare const mermaid: Mermaid;

// this object exists so that we don't need to keep declaring "const mermaid" as above
// and to centralize all mermaid operations
export const myMermaid = {
    mermaids: new Map<string, string>(),

    initialize(config: MermaidConfig) {
        mermaid.initialize(config);
    },

    async run() {
        const newMermaids = new Map<string, string>();
        const documentMermaids = document.querySelectorAll(".mermaid");

        for (const dMermaid of documentMermaids) {
            const definition = dMermaid.textContent ?? "";

            let newSvg = this.mermaids.get(definition);

            if (!newSvg) {
                const type = mermaid.detectType(definition);

                // bindFunctions
                const { svg } = await mermaid.render(type, definition);
                newSvg = svg;
            }

            newMermaids.set(definition, newSvg);
            dMermaid.innerHTML = newSvg;
        }

        this.mermaids = newMermaids;
    },
};
